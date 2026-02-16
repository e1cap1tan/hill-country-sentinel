#!/bin/bash

# Hill Country Sentinel — Bulk Article Updater
# Updates existing article HTML files with new header and meta tags

echo "Hill Country Sentinel — Bulk Article Updater"
echo "============================================="

cd "$(dirname "$0")/.."

# Counter for updated files
updated_count=0

# Function to update a single article
update_article() {
    local file="$1"
    local updated=false
    
    echo "Processing: $file"
    
    # Create a temporary file
    local temp_file=$(mktemp)
    
    # Read the file line by line
    while IFS= read -r line; do
        # Update CSS version from v11 to v12
        if [[ "$line" == *"shared.css?v=11"* ]]; then
            line="${line//v=11/v=12}"
            updated=true
        fi
        
        # Update JS version from v11 to v12
        if [[ "$line" == *"layout.js?v=11"* ]]; then
            line="${line//v=11/v=12}"
            updated=true
        fi
        
        # Add article-category meta tag after viewport meta
        if [[ "$line" == *'<meta name="viewport"'* ]]; then
            echo "$line" >> "$temp_file"
            
            # Check if article-category meta doesn't already exist
            if ! grep -q 'meta name="article-category"' "$file"; then
                # Determine category based on filename and content
                local category="news"  # default
                
                # Try to determine category from filename or path
                if [[ "$file" == *"candidate"* ]] || grep -q "candidate\|election\|mayor\|council" "$file" 2>/dev/null; then
                    category="candidate-news"
                elif [[ "$file" == *"policy"* ]] || grep -q "policy\|government\|council\|ordinance\|zoning" "$file" 2>/dev/null; then
                    category="policy-feed"
                elif [[ "$file" == *"business"* ]] || grep -q "business\|development\|economic" "$file" 2>/dev/null; then
                    category="business-watch"
                fi
                
                echo "    <meta name=\"article-category\" content=\"$category\">" >> "$temp_file"
                updated=true
            fi
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # If file was updated, replace it
    if [ "$updated" = true ]; then
        mv "$temp_file" "$file"
        echo "  ✓ Updated: $file"
        return 0
    else
        rm "$temp_file"
        echo "  - No changes: $file"
        return 1
    fi
}

# Find all HTML files (excluding template)
echo "Finding article files..."
article_files=()
while IFS= read -r -d '' file; do
    article_files+=("$file")
done < <(find articles -name "*.html" -not -name "template.html" -print0)

echo "Found ${#article_files[@]} article files"
echo ""

# Process each file
for file in "${article_files[@]}"; do
    if update_article "$file"; then
        ((updated_count++))
    fi
done

echo ""
echo "============================================="
echo "Update complete!"
echo "Updated $updated_count out of ${#article_files[@]} files"

# If any files were updated, suggest git commands
if [ $updated_count -gt 0 ]; then
    echo ""
    echo "Run the following commands to commit changes:"
    echo "git add articles/"
    echo "git commit -m \"Update article files with new header and meta tags\""
fi