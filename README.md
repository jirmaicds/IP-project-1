# PrimeCare Hospital Operations Dashboard

A self-contained hospital dashboard website for **PrimeCare Medical Center**, built from the attached
`PrimeCare_Information_Systems_Proposal.docx`. No build step, package manager, or internet connection is required.

## Run it

Open any of these files in a modern browser:

- `index.html` — dashboard (Overview, Patient Flow, Information Systems, Architecture Diagram, Reports, Settings, Account Profile)
- `systems.html` — standalone Information Systems page (alternate)
- `architecture.html` — standalone diagrams page (alternate)

Or serve the folder with any static server:

```powershell
python -m http.server 8000
# then visit http://localhost:8000
```

## Pages

| Page | Contents |
|---|---|
| `index.html` → Overview | KPI cards, patient visit chart, bed occupancy, department load, searchable patient queue, improvements delivered |
| `index.html` → Patient Flow | Searchable queue board (registration → billing), waiting-time analytics |
| `index.html` → Information Systems | The 7 proposed systems from §5 with features and the concerns each one resolved |
| `index.html` → Architecture Diagram | Three colorful diagrams generated from the proposal |
| `index.html` → Reports & Plans | Revenue chart, 7 implementation phases (§7.1), resolved concerns (§7.2), CSV export |
| `index.html` → Settings | Profile summary, security checklist and dashboard preferences (§6.4) |
| `index.html` → Account Profile | Personal details, read-only department/role, access level, account security and activity |

Header search was removed; patient search now lives with the patient list in Overview and on the queue board
in Patient Flow. The bell icon opens a notification dropdown. On wide screens the account chip appears in the
header; on narrow screens it appears in the sidebar menu.

## Diagrams

All diagrams are editable standalone SVGs with colorful gradients, shown in the **Architecture Diagram** view of
`index.html` (and in the standalone `architecture.html`):

| Tab | Source | File |
| --- | --- | --- |
| Layered Architecture | §6.1 | `assets/primecare-architecture.svg` |
| Information Exchange | §6.2 | `assets/primecare-data-flow.svg` |
| Organizational Structure | §1.2 | `assets/primecare-org-chart.svg` |

## Files

```
index.html                             Dashboard shell + Overview, Flow, Reports, Settings, Profile
systems.html                           Information Systems page
architecture.html                      Diagrams page
styles.css                             Design system, charts, dropdown, profile, responsive rules
app.js                                 Shared navigation, sample data, SVG charts, searches, exports
assets/primecare-architecture.svg      Four-layer HIS architecture diagram
assets/primecare-data-flow.svg         Department information exchange diagram
assets/primecare-org-chart.svg         Organizational structure diagram
```

The dashboard is framed as a **post-implementation** view: figures show the positive outcomes described in the
proposal (§3 problems solved by the §5 systems, §6 integration and §7 benefits) — shorter waits, faster lab
results, healthy inventory and resolved risks. All person names, patient IDs, dates and figures are
**representative sample data** for demonstration; the diagrams and system descriptions are derived from the
proposal document.
