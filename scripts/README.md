# Content Pipeline Scripts

Scripts for managing content in the Comal County GOP Watch feeds.

## add-entry.js

Add a new entry to any of the three feed JSON files.

### Usage

```bash
node scripts/add-entry.js \
  --feed candidate \
  --title "Commissioner Files for Re-election" \
  --summary "Comal County Commissioner John Smith has filed for re-election in the 2026 primary." \
  --source "Herald-Zeitung" \
  --sourceUrl "https://herald-zeitung.com/article/123" \
  --category "elections" \
  --tags "2026-election,comal-county"
```

### Required Flags

| Flag          | Description                                        |
|---------------|----------------------------------------------------|
| `--feed`      | Feed to add to: `candidate`, `policy`, or `business` |
| `--title`     | Headline for the entry                             |
| `--summary`   | 1-3 sentence description                          |
| `--source`    | Source name (e.g. "Herald-Zeitung")                |
| `--sourceUrl` | URL to the original article/post                   |
| `--category`  | Category slug (see taxonomy below)                 |
| `--tags`      | Comma-separated tag slugs                          |

### Optional Flags

| Flag                 | Description                                |
|----------------------|--------------------------------------------|
| `--relatedCandidate` | Slug of related candidate/official         |
| `--imageUrl`         | URL or path to an associated image         |

### Auto-generated Fields

- **id** — Generated from feed prefix + timestamp + title slug (e.g. `cn-1707670800000-commissioner-files`)
- **date** — Set to current ISO datetime

### Examples

**Add candidate news:**
```bash
node scripts/add-entry.js \
  --feed candidate \
  --title "Isaac Files HB 1234 on Parental Rights" \
  --summary "Rep. Carrie Isaac filed HB 1234 to expand parental rights in education." \
  --source "Texas Legislature Online" \
  --sourceUrl "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=90R&Bill=HB1234" \
  --category "legislation" \
  --tags "parental-rights,education,carrie-isaac" \
  --relatedCandidate "carrie-isaac"
```

**Add policy update:**
```bash
node scripts/add-entry.js \
  --feed policy \
  --title "City Council Approves New Zoning Ordinance" \
  --summary "New Braunfels City Council voted 5-2 to approve a zoning change for the downtown area." \
  --source "Herald-Zeitung" \
  --sourceUrl "https://herald-zeitung.com/article/456" \
  --category "city-council" \
  --tags "new-braunfels,zoning,downtown"
```

**Add business watch entry:**
```bash
node scripts/add-entry.js \
  --feed business \
  --title "Local Restaurant Donates to PAC" \
  --summary "A popular New Braunfels restaurant was listed as a major donor to a local political action committee." \
  --source "Campaign Finance Reports" \
  --sourceUrl "https://www.ethics.state.tx.us/" \
  --category "donations" \
  --tags "new-braunfels,campaign-finance"
```

---

## Categories & Tags Taxonomy

### Candidate News Categories
| Slug                | Description                                     |
|---------------------|-------------------------------------------------|
| `elections`         | Election filings, results, campaign updates     |
| `legislation`       | Bills filed, votes cast, legislative activity   |
| `county-government` | County-level official actions and changes        |
| `public-statement`  | Official statements, press releases             |

### Policy Feed Categories
| Slug                | Description                                     |
|---------------------|-------------------------------------------------|
| `city-council`      | City council votes, ordinances, resolutions     |
| `county-government` | County commissioners court actions              |
| `education`         | School board decisions, CISD policies           |
| `infrastructure`    | Roads, utilities, development projects          |
| `public-safety`     | Law enforcement, fire, emergency services       |

### Business Watch Categories
| Slug                | Description                                     |
|---------------------|-------------------------------------------------|
| `donations`         | Political campaign donations by businesses      |
| `endorsements`      | Business or organization endorsements           |
| `social-stance`     | Businesses taking public social/political positions |
| `hiring-practices`  | DEI policies, hiring practices of note          |

### Common Tags
| Category   | Examples                                                      |
|------------|---------------------------------------------------------------|
| Geographic | `new-braunfels`, `gruene`, `comal-county`                     |
| Topic      | `2026-election`, `transportation`, `budget`, `parental-rights` |
| Entity     | `chamber-of-commerce`, `comal-isd`, `commissioners-court`     |
| Person     | `neal-linnartz`, `carrie-isaac`, `donna-campbell`              |

Tags are free-form lowercase hyphenated slugs. Use existing tags when possible for consistency.

---

## Automation

The JSON files are designed for automated updates. To integrate with a content pipeline:

1. Run `add-entry.js` with the appropriate flags
2. Commit and push the updated JSON file
3. GitHub Pages will automatically deploy the changes

Example in a CI/CD pipeline:
```bash
node scripts/add-entry.js --feed candidate --title "$TITLE" --summary "$SUMMARY" \
  --source "$SOURCE" --sourceUrl "$URL" --category "$CATEGORY" --tags "$TAGS"
git add data/
git commit -m "content: add $FEED entry - $TITLE"
git push origin main
```
