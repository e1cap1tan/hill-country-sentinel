#!/usr/bin/env python3
import json
import re
import os

def shorten_text(text, target_ratio=0.67):
    """
    Shorten text to approximately target_ratio of original length.
    Preserve key facts, names, dates, and quotes while removing filler.
    """
    if not text or len(text) < 50:
        return text
    
    original_length = len(text)
    target_length = int(original_length * target_ratio)
    
    # If already short enough, return as-is
    if original_length <= target_length:
        return text
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    # Keep essential sentences (those with names, dates, numbers, quotes)
    essential_sentences = []
    other_sentences = []
    
    for sentence in sentences:
        is_essential = (
            # Contains proper names (capitalized words)
            len(re.findall(r'\b[A-Z][a-z]+', sentence)) >= 2 or
            # Contains dates
            re.search(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}/\d{1,2}|\d{4}|Feb|Jan|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b', sentence) or
            # Contains numbers/money
            re.search(r'\$[\d,]+|\b\d+(?:\.\d+)?\s*(?:million|billion|thousand|percent|%|acres?|votes?)\b', sentence) or
            # Contains quotes
            '"' in sentence or
            # Contains specific action words
            re.search(r'\b(?:voted|approved|rejected|filed|announced|elected|appointed|resigned|passed|signed)\b', sentence, re.IGNORECASE)
        )
        
        if is_essential:
            essential_sentences.append(sentence)
        else:
            other_sentences.append(sentence)
    
    # Start with essential sentences
    result_sentences = essential_sentences[:]
    current_length = sum(len(s) for s in result_sentences)
    
    # Add other sentences until we reach target length
    for sentence in other_sentences:
        if current_length + len(sentence) <= target_length:
            result_sentences.append(sentence)
            current_length += len(sentence)
    
    result = ' '.join(result_sentences).strip()
    
    # Clean up any redundant phrases
    result = re.sub(r'\b(?:according to|as reported by|the report states that|it was noted that)\b', '', result, flags=re.IGNORECASE)
    result = re.sub(r'\s+', ' ', result)  # Normalize whitespace
    
    return result.strip()

def process_data_file(filepath):
    """Process a single JSON data file"""
    print(f"\nProcessing {filepath}...")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    shortened_count = 0
    total_original_words = 0
    total_shortened_words = 0
    
    for entry in data:
        if 'summary' in entry and entry['summary']:
            original_summary = entry['summary']
            original_word_count = len(original_summary.split())
            
            if original_word_count > 25:  # Only shorten substantial summaries
                shortened_summary = shorten_text(original_summary)
                shortened_word_count = len(shortened_summary.split())
                
                if shortened_word_count < original_word_count:
                    entry['summary'] = shortened_summary
                    shortened_count += 1
                    total_original_words += original_word_count
                    total_shortened_words += shortened_word_count
                    
                    print(f"  Shortened: {entry['id'][:50]}...")
                    print(f"    {original_word_count} → {shortened_word_count} words")
    
    # Write back to file
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')
    
    if shortened_count > 0:
        avg_reduction = ((total_original_words - total_shortened_words) / total_original_words) * 100
        print(f"  Shortened {shortened_count} articles")
        print(f"  Average reduction: {avg_reduction:.1f}%")
    else:
        print(f"  No articles needed shortening")
    
    return shortened_count

def main():
    data_files = [
        'data/candidate-news.json',
        'data/policy-feed.json',
        'data/business-watch.json'
    ]
    
    total_shortened = 0
    
    for filepath in data_files:
        if os.path.exists(filepath):
            count = process_data_file(filepath)
            total_shortened += count
        else:
            print(f"Warning: {filepath} not found")
    
    print(f"\n✓ Total articles shortened: {total_shortened}")

if __name__ == "__main__":
    main()