# FIBO Node Atlas

A browser for the Financial Industry Business Ontology (FIBO), published as a static page at
https://longreach.ai/fibo/. It loads the whole ontology graph in the browser and lets you explore
it by tier, concept family and domain, walk the class hierarchy, and inspect any node.

## Layout

```
fibo/
├── index.html      live: page shell                      ─┐
├── atlas.css       live: styles                           │ served by GitHub Pages
├── atlas.js        live: browser logic                    │ at https://longreach.ai/fibo/
├── data.js         live: generated graph data (3 MB)     ─┘
├── build/          maintenance: scripts that produce data.js (not served)
│   ├── fibo_graph.py
│   └── fibo_classify.py
├── data/           maintenance: ontology sources and exports (not served, not in git)
│   ├── 2026Q2-fibo/              unzipped FIBO release (220 Turtle files)
│   ├── downloads/                the release zip as downloaded
│   ├── fibo_nodes.csv            raw node list from fibo_graph.py
│   └── fibo_nodes_classified.csv node list with tier, family and CURIE from fibo_classify.py
└── README.md
```

Only the four top-level files are live. The Jekyll config at the repo root excludes `build/` and
`data/` from the site, and `.gitignore` keeps `data/` out of the repository. `data.js` is
generated, but it is committed because the site is static and the page needs it.

## Where the data comes from

The source is the FIBO **2026Q2 production release** from the EDM Council, downloaded as
`prod.ttl.zip` from the release directory:

    https://spec.edmcouncil.org/fibo/ontology/master/2026Q2/prod.ttl.zip

The zip unpacks to `fibo/ontology/master/2026Q2/`, which is kept here as `data/2026Q2-fibo/`.
It holds 220 Turtle files: one `owl:Ontology` per file, grouped into the FIBO domains
(FND, BE, FBC, SEC, DER, IND, LOAN, CAE, MD, BP, ACTUS, EXMP), plus the `AboutFIBOProd.ttl`
entry point that imports them all. The production release is the subset of FIBO that EDM Council
has marked as released, including its reference data (markets, currencies, countries, legal
entities). It is not the full development repository.

## What the data covers

`data.js` holds every node and most edges of the RDF graph formed by parsing all 220 files
together. Totals for 2026Q2:

| Measure | Count |
|---|---|
| Triples | 134,946 |
| Nodes | 20,959 (17,388 named, 3,571 blank) |
| Edges | 90,457 in the full graph, 29,298 kept for browsing |

A node is anything that appears as a subject or object of a triple, so the count includes far more
than concepts. The classifier sorts nodes into seven tiers:

| Tier | Nodes | What it is |
|---|---|---|
| Core concepts | 2,240 | `owl:Class` definitions such as Lender, Loan, Payment Obligation |
| Properties | 781 | Object, datatype and annotation properties |
| Reference data | 11,698 | Named individuals: markets, MICs, currencies, countries, benchmarks, legal entities |
| Imported vocabulary | 606 | OMG Commons, OMG LCC and W3C terms FIBO uses but does not define |
| External references | 1,517 | Web pages and GLEIF records cited as sources |
| Ontology structure | 546 | Ontology and module IRIs, version IRIs |
| OWL machinery | 3,571 | Blank nodes: restrictions, unions, lists |

Classes and individuals also get a concept family, such as parties and roles, contracts,
financial instruments, identifiers, dates or places. The classifier assigns it by walking the
superclass chain to a table of anchor names. That table is `FAMILIES` at the top of
`build/fibo_classify.py`, and it is the place to tune the grouping.

The browsable edges leave out `rdf:type`, `rdfs:subClassOf`, `rdfs:isDefinedBy` and
`owl:imports`, which the page shows through dedicated fields instead. They also leave out edges
touching blank nodes, which the page renders as readable constraint lines on their class, for
example `hasLender some Lender`.

Each named node carries its CURIE shortcode, such as `fibo-be-oac-exec:ExternalAuditor`, built
from the `@prefix` declarations in the Turtle files. CURIEs are unique within a release. Blank
nodes have no identity in RDF and get a positional id that is stable only for one build of
`data.js`.

Not included: the OMG Commons and LCC ontologies that FIBO imports, FIBO's development branch,
and anything outside the production release. Imported terms appear only where FIBO references
them, and without their definitions.

## Refreshing the data for a new release

1. Download the new production release zip into `data/downloads/`. The URL follows the release
   name, for example `https://spec.edmcouncil.org/fibo/ontology/master/2026Q4/prod.ttl.zip`.
2. Unzip it into `data/<release>-fibo/`, so the Turtle files sit under
   `data/<release>-fibo/ontology/master/<release>/`.
3. Set `RELEASE_DIR` in both scripts under `build/` to the new folder name.
4. Rebuild. The scripts work from any directory:

   ```
   uv run build/fibo_graph.py        # optional: prints graph stats, writes data/fibo_nodes.csv
   uv run build/fibo_classify.py     # writes data.js and data/fibo_nodes_classified.csv
   ```

   Both scripts also accept explicit input and output paths as arguments.
5. Update the "FIBO version" link in the header of `index.html`.
6. Compare the counts the classifier prints with the tables above, and update this file.
7. Commit `data.js`, `index.html` and `README.md`. Pushing to `main` deploys the site.

The scripts need only `uv`. Their dependencies, `rdflib` and `networkx`, are declared inline and
installed on first run.

## Local preview

Open `index.html` directly in a browser, or run `python3 -m http.server` in this folder. The page
loads `data.js` as a script, so it works from `file://` as well as over HTTP.

## Reference

- [FIBO home page](https://spec.edmcouncil.org/fibo/)
- [FIBO on GitHub](https://github.com/edmcouncil/fibo)
- [OWL downloads](https://spec.edmcouncil.org/fibo/page/owl)
- [Downloads page, all releases and formats](https://edmconnect.edmcouncil.org/okgspecialinterestgroup/resources-sig-link/resources-sig-link-fibo-products-download)
- [2026Q2 production Turtle, prod.ttl.zip](https://spec.edmcouncil.org/fibo/ontology/master/2026Q2/prod.ttl.zip)

FIBO's repository offers three entry-point files for ingesting the production model:

- **AboutFIBOProd.rdf** is the master metadata and entry-point file for the production release.
  It uses `owl:imports` to pull in every production domain ontology from its subfolder.
- **AboutFIBOProd-TBoxOnly.rdf** imports only the schema axioms, classes and properties, without
  reference data such as currency or country codes. Use it when a graph store handles instance
  data poorly.
- **AboutFIBOProd-IncludingReferenceData.rdf** imports the schema plus all reference data,
  geographic codes and industry code sets as individuals.
  [Source](https://github.com/edmcouncil/fibo/blob/master/AboutFIBOProd-IncludingReferenceData.rdf)

This atlas loads every Turtle file in the production zip, which matches the
including-reference-data variant.
