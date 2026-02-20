#!/bin/bash
# SEO batch update script for Hill Country Sentinel profile pages
# This script adds basic meta tags, canonical URLs, and breadcrumb navigation to all profile pages

cd /Users/fredassistant/.openclaw/workspace/projects/hill-country-sentinel/profiles

for file in *.html; do
    # Skip if file doesn't exist
    [ -f "$file" ] || continue
    
    # Extract candidate name from filename (remove .html and convert dashes to spaces/caps)
    candidate_slug=$(basename "$file" .html)
    candidate_name=$(echo "$candidate_slug" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
    
    echo "Processing: $candidate_name ($file)"
    
    # Check if file already has canonical URL (indicating it's been updated)
    if grep -q "canonical" "$file"; then
        echo "  Skipping - already has canonical URL"
        continue
    fi
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Extract title to determine office/position
    title_line=$(grep -m1 "<title>" "$file")
    
    # Basic meta description based on content
    meta_desc="$candidate_name profile - View voting record, biography, and contact information for this New Braunfels and Comal County political candidate."
    
    # Add meta tags after existing title
    sed -i '' "/<title>/a\\
    <meta name=\"description\" content=\"$meta_desc\">\\
    <meta name=\"keywords\" content=\"$candidate_name, New Braunfels, Comal County, politics, candidate, elected official\">\\
    \\
    <!-- Canonical URL -->\\
    <link rel=\"canonical\" href=\"https://e1cap1tan.github.io/hill-country-sentinel/profiles/$file\">\\
    \\
    <!-- Open Graph / Facebook -->\\
    <meta property=\"og:type\" content=\"profile\">\\
    <meta property=\"og:url\" content=\"https://e1cap1tan.github.io/hill-country-sentinel/profiles/$file\">\\
    <meta property=\"og:title\" content=\"$candidate_name - Hill Country Sentinel\">\\
    <meta property=\"og:description\" content=\"$meta_desc\">\\
    <meta property=\"og:site_name\" content=\"Hill Country Sentinel\">\\
    \\
    <!-- Twitter Card -->\\
    <meta name=\"twitter:card\" content=\"summary\">\\
    <meta name=\"twitter:title\" content=\"$candidate_name - Hill Country Sentinel\">\\
    <meta name=\"twitter:description\" content=\"$meta_desc\">\\
    " "$file"
    
    echo "  Added meta tags and canonical URL"
done

echo ""
echo "Profile SEO update complete!"
echo "Review the changes and commit when ready."