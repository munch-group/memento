- Clean up chr3 notebook in geneinfo repo

- - Move repos to office machine

- interaction_store
- geneinfo
- CTCF-inversion-data
- VEP
- primate_protein_var
- cDEGexploration
- chromatin repos



# All laptop repos

`find ~/ -name '.git' -maxdepth 5 -type d -not -path '**/github-backup/**' -exec dirname {} \;`

- `~/backup_phasic`: 
- `~/phasic_backup`: 
- `~/phasic`: 


# All cluster repos

`find -L . -maxdepth 6 -user kmt -name '.git' -type d -not -path '**/.pixi/**' -exec dirname {} \; 2>&1 | grep -v 'Permission denied' | grep -v 'Too many levels of symbolic links'`

- `./pratt_et_al/IBDmix`: 

# Shannon

- `./xy-brain/people/kmt/y-strat-gwas`: 

# Phasic 

- `./phasetype/people/kmt/_phase-type-distributions`: 
- `./phasetype/people/kmt/_PtDAlgorithms`: 
- `./sticcs`: 

# GPN

- `./gpn`: 
- `./johan_gpn/people/johanulsrup/johan_gpn`: 

# Birds

- `./Birds/faststorage/people/kmt/bird-hotspots`: 

# Interference map

- `./primatediversity/people/kmt/interference_map`: 
- `./hri/faststorage/people/kmt/interference_map`: 

# Baboons

- `./primatediversity/people/kmt/baboon_flagship`: 
- `./primatediversity/people/kmt/baboons_v3_calling`: 

- `./xy-drive/people/kmt/baboons`: 

# Primate prot var

- `./primatediversity/people/kmt/alphagenome_atlas`: 
- `./primatediversity/people/kmt/vep_data`: 
- `./primatediversity/people/kmt/atlas-variant-ages`: 
- `./primatediversity/people/kmt/relate1Kgenomes`: 
- `./primatediversity/people/kmt/primate-prot-var`: 

# Chromatin

- `./hic-spermatogenesis/data/macaque/HiC-Pro`: 
- `./hic-spermatogenesis/people/sojern/hic-compartment-borders`: 
- `./xy-drive/people/kmt/hic-spermatogenesis`: 
- `./xy-drive/people/kmt/chromatin-structure`: 
- `./xy-drive/people/kmt/hic-xy-sperm`: 


-------------------------------------------------------------

# cDEGexploration

- `cDEGexploration/_pixi.toml`: 
- `cDEGexploration/_quarto.yml`: 
- `cDEGexploration/binder`: 
- `cDEGexploration/captions.lua`: 
- `cDEGexploration/data`: 
- `cDEGexploration/environment.yml`: 
- `cDEGexploration/filters`: 
- `cDEGexploration/global_params.py`: 
- `cDEGexploration/global_params.yml`: 
- `cDEGexploration/index.qmd`: 
- `cDEGexploration/LICENSE`: 
- `cDEGexploration/manuscript`: 
- `cDEGexploration/notebooks`: 
- `cDEGexploration/pixi.lock`: 
- `cDEGexploration/pixi.toml`: 
- `cDEGexploration/README.md`: 
- `cDEGexploration/references.bib`: 
- `cDEGexploration/references.qmd`: 
- `cDEGexploration/reports`: 
- `cDEGexploration/requirement_suggestions.txt`: 
- `cDEGexploration/requirements.txt`: 
- `cDEGexploration/results`: 
- `cDEGexploration/scripts`: 
- `cDEGexploration/slides`: 
- `cDEGexploration/thesis`: 
- `cDEGexploration/workflow.py`: 

# gdk:/xy-drive/people/kmt

- `atlas-variant-ages`: 
- `baboons`: 
- `cDEGexploration`: 
- `chromatin-structure`: 
- `compartments_and_edges.ipynb`: 
- `comp_coords`: 
- `comp_coords.tar.gz`: 
- `coords.ipynb`: 
- `data`: 
- `experiment.ipynb`: 
- `hicmaps`: 
- `hic-spermatogenesis`: 
- `hic-xy-sperm`: 
- `human_nean_admixture.ipynb`: 
- `IR_gwas`: 
- `macaque_hic.ipynb`: 
- `nb02_sfari.ipynb`: 
- `nerd-2026.ipynb`: 
- `notebook_overview.md`: 
- `primate-prot-var`: 
- `PsychENCODE`: 
- `rajarajan-neuron-hic`: 
- `relate1Kgenomes`: 
- `sc-kmt-27485758.out`: 
- `sojern.ipynb`: 
- `synapse`: 
- `tidy_up_notes.qmd`: 
- `tooltips`: 
- `wavelets.ipynb`: 

# gdk:/xy-drive/people/kmt/cDEGexploration

- `binder`: 
- `captions.lua`: 
- `compartments.csv`: 
- `comp_coords.pickle`: 
- `cooler.yml`: 
- `data`: 
- `environment.yml`: 
- `env.yml`: 
- `filters`: 
- `global_params.py`: 
- `global_params.yml`: 
- `index.qmd`: 
- `LICENSE`: 
- `manuscript`: 
- `_notebooks`: 
- `notebooks`: 
- `pixi.lock`: 
- `pixi.toml`: 
- `_quarto.yml`: 
- `README.md`: 
- `references.bib`: 
- `references.qmd`: 
- `reports`: 
- `requirements.txt`: 
- `requirement_suggestions.txt`: 
- `results`: 
- `scripts`: 
- `slides`: 
- `thesis`: 
- `workflow.py`: 


# Science stuff on Desktop

`/Users/kmt/Desktop/Science stuff`

```
Science stuff/
|-- ai-coding-assistant-setup.md
|-- Akbari_2026_Table_S6.1.csv
|-- Akbari_et_al-2026-Nature.sup-16 (dragged).pdf
|-- akbari_reich_som_fig_s5_data.csv
|-- Akbari_Reich_SOM_Figure.csv
|-- April_Update.pdf
|-- arg-dashboard.ipynb
|-- ASC_variant_results.tsv.bgz
|-- baboon_ID_Master.v4.xlsx
|-- bdmi.ipynb
|-- bird-html-notebooks
|   |-- 01_trees.html
|   |-- 021_global_gcstar.html
|   |-- 03_hotspot_gcstar.html
|   |-- 031_all_subst_rates.html
|   |-- 04_s-jump.html
|   `-- 06_signatures.html
|-- davide_segments_v2
|-- Eriks paper
|   |-- allref_reeval.png
|   |-- allref.png
|   |-- Comments_to_authors_final-2.pdf
|   |-- femaleonly_reeval.png
|   |-- femaleonly.png
|   |-- femalerefallquery_reeval.png
|   |-- femalerefallquery.png
|   |-- Negative selection on baboon admixture is strongest on chromosome X revision - Google Docs.webloc
|   `-- Supplementary and figures, baboon admixture - Google Docs.webloc
|-- Files from Moi
|   |-- aea6774_AMHIR.Altai.bed
|   |-- aea6774_AMHIR.Chagyrskya.bed
|   |-- aea6774_AMHIR.Vindija.bed
|   |-- Altai.bed
|   |-- AMH_in_NeanX.ipynb
|   |-- ECH_75.bed
|   |-- ECH_TableS1.csv
|   |-- ECH.bed
|   `-- image.png
|-- Fun
|   |-- 3dgenomics
|   |   |-- 3d.ipynb
|   |   |-- contact_map_with_arcs.ipynb
|   |   |-- contact_map_with_sidepanel.ipynb
|   |   |-- contact_map.ipynb
|   |   |-- contact_map2.ipynb
|   |   |-- data
|   |   |   |-- genomic-embeddings.pq
|   |   |   `-- higlass-viewconfig.json
|   |   |-- pixi.lock
|   |   `-- pixi.toml
|   |-- claude_request.py
|   |-- claude-session.sh
|   |-- copilot_api
|   |   |-- copilot_api.py
|   |   `-- pixi.toml
|   |-- crypto
|   |   |-- 1.11. Ensembles- Gradient boosting, random forests, bagging, voting, stacking — scikit-learn 1.7.2 d….webloc
|   |   |-- dashboard.ipynb
|   |   |-- orstein.ipynb
|   |   |-- pixi.lock
|   |   `-- pixi.toml
|   |-- cryptopatterns
|   |   |-- cryptopatterns
|   |   |   |-- __init__.py
|   |   |   |-- data.py
|   |   |   |-- higher_order.py
|   |   |   |-- patterns.py
|   |   |   `-- transfer_entropy.py
|   |   |-- examples
|   |   |   `-- tutorial.ipynb
|   |   |-- LICENSE
|   |   |-- pyproject.toml
|   |   |-- README.md
|   |   `-- tests
|   |       |-- __init__.py
|   |       `-- test_basic.py
|   |-- gene_heat_graphs.ipynb
|   |-- GPN
|   |-- jscatter
|   |   |-- higlass.patch
|   |   |-- jupyter-scatter-tutorial
|   |   |   |-- _config.yml
|   |   |   |-- _toc.yml
|   |   |   |-- CITATION.cff
|   |   |   |-- images
|   |   |   |-- LICENSE
|   |   |   |-- notebooks
|   |   |   |-- pyproject.toml
|   |   |   |-- README.md
|   |   |   |-- teaser.gif
|   |   |   `-- uv.lock
|   |   |-- pixi.lock
|   |   |-- pixi.toml
|   |   |-- play_files
|   |   |   `-- libs
|   |   |-- play.html
|   |   |-- play.ipynb
|   |   `-- play.ipynb - JupyterLab.html
|   |-- l2-ultramaximizer.pdf
|   |-- magic_markdown
|   |   `-- example
|   |-- Notebooks
|   |   |-- __pycache__
|   |   |   |-- data.cpython-37.pyc
|   |   |   `-- fetchers.cpython-37.pyc
|   |   |-- 9606.protein.links.v11.0.txt
|   |   |-- Blackstyle.ipynb
|   |   |-- Bokeh.ipynb
|   |   |-- carlota.ipynb
|   |   |-- chrom_ideograms.ipynb
|   |   |-- circosplay
|   |   |   |-- bands.conf
|   |   |   |-- circos_play.ipynb
|   |   |   |-- circos.conf
|   |   |   |-- circos.pdf
|   |   |   |-- circos.png
|   |   |   |-- circos.svg
|   |   |   |-- data
|   |   |   |-- ideogram.conf
|   |   |   |-- ideogram.label.conf
|   |   |   |-- ideogram.position.conf
|   |   |   |-- mycircos.conf
|   |   |   |-- mycircos.png
|   |   |   |-- mycircos.svg
|   |   |   |-- segdup.txt
|   |   |   |-- segdupf.txt
|   |   |   |-- text.genes.znf.txt
|   |   |   `-- ticks.conf
|   |   |-- Colors.ipynb
|   |   |-- crosswavelets.R
|   |   |-- CurveFitting.py
|   |   |-- custom_plugins.ipynb
|   |   |-- CytoscapeConfiguration
|   |   |   |-- __MACOSX
|   |   |   |-- 3
|   |   |   |-- app-data
|   |   |   |-- commandHistory.txt
|   |   |   |-- cytoscape3.props
|   |   |   |-- groupSettings.props
|   |   |   |-- images3
|   |   |   |-- layout.attribute-circle.props
|   |   |   |-- layout.attribute-grid.props
|   |   |   |-- layout.attributes-layout.props
|   |   |   |-- layout.circular.props
|   |   |   |-- layout.cose.props
|   |   |   |-- layout.degree-circle.props
|   |   |   |-- layout.force-directed-cl.props
|   |   |   |-- layout.force-directed.props
|   |   |   |-- layout.fruchterman-rheingold.props
|   |   |   |-- layout.grid.props
|   |   |   |-- layout.hierarchical.props
|   |   |   |-- layout.isom.props
|   |   |   |-- layout.kamada-kawai.props
|   |   |   |-- layout.stacked-node-layout.props
|   |   |   |-- linkout.props
|   |   |   |-- tracker.recent.sessions
|   |   |   |-- vizmapper.props
|   |   |   `-- web
|   |   |-- data.py
|   |   |-- download_sample_data.py
|   |   |-- ete3_play.ipynb
|   |   |-- example.txt
|   |   |-- execute_notebook.sh
|   |   |-- female_chrx_decode_map_hg19.ipynb
|   |   |-- female.rmap
|   |   |-- fetchers.py
|   |   |-- fisher.ipynb
|   |   |-- gene_heat_graphs.ipynb
|   |   |-- gene_info.ipynb
|   |   |-- gene_lists.ipynb
|   |   |-- gene-report.csv
|   |   |-- ggtree.R
|   |   |-- grm.ipynb
|   |   |-- hiplot.ipynb
|   |   |-- horizonplot.R
|   |   |-- iker_chroms.ipynb
|   |   |-- image.html
|   |   |-- importance_sampling.ipynb
|   |   |-- Interact.ipynb
|   |   |-- ipyparallel.ipynb
|   |   |-- iPythonPlay.ipynb
|   |   |-- iris.html
|   |   |-- JupyterSlides.ipynb
|   |   |-- logsum.py
|   |   |-- london_plaques.png
|   |   |-- maps.R
|   |   |-- MCMC-sampling-for-dummies.ipynb
|   |   |-- Mixed_coalescent_densities.ipynb
|   |   |-- mpld3_demo.ipynb
|   |   |-- multiprocess_decorator.ipynb
|   |   |-- Multiprocessing.ipynb
|   |   |-- new_ideograms.R
|   |   |-- NpPresentPlay.ipynb
|   |   |-- PCA.ipynb
|   |   |-- PlayingWithSelection.ipynb
|   |   |-- plotly.ipynb
|   |   |-- Plotting_Maps.ipynb
|   |   |-- PlottingCookbook.ipynb
|   |   |-- PoolNielsen.ipynb
|   |   |-- PyPathway
|   |   |   |-- AUTHORS.rst
|   |   |   |-- clean.sh
|   |   |   |-- CONTRIBUTING.rst
|   |   |   |-- docs
|   |   |   |-- examples
|   |   |   |-- LICENSE
|   |   |   |-- MANIFEST
|   |   |   |-- MANIFEST.in
|   |   |   |-- notebook_tests
|   |   |   |-- pypathway
|   |   |   |-- README.md
|   |   |   |-- requirements.txt
|   |   |   |-- setup.cfg
|   |   |   |-- setup.py
|   |   |   `-- tests
|   |   |-- pyslim_tests.ipynb
|   |   |-- R_to_Python.ipynb
|   |   |-- RandPython.ipynb
|   |   |-- rasmus.ipynb
|   |   |-- rise.css
|   |   |-- sex-averaged.rmap
|   |   |-- sex-averaged.rmap.txt
|   |   |-- sliderPlugin.ipynb
|   |   |-- som.Rmd
|   |   |-- StationaryDistribution.ipynb
|   |   |-- sympy.ipynb
|   |   |-- template.ipynb
|   |   |-- template2.ipynb
|   |   |-- Thumbnails.ipynb
|   |   |-- tmp.vcf.gz
|   |   |-- umap.ipynb
|   |   |-- Untitled.ipynb
|   |   |-- Untitled1.ipynb
|   |   |-- Untitled2.ipynb
|   |   |-- Untitled3.ipynb
|   |   |-- Untitled4.ipynb
|   |   |-- vaex
|   |   |   `-- vaex
|   |   |-- vaex_jupyter.ipynb
|   |   |-- vaex.ipynb
|   |   |-- vcfparsing.ipynb
|   |   |-- view_high_c_with_vaex.ipynb
|   |   |-- visJS2jupyter
|   |   |   |-- _config.yml
|   |   |   |-- cytoscape_styles
|   |   |   |-- docs
|   |   |   |-- LICENSE
|   |   |   |-- MANIFEST
|   |   |   |-- notebooks
|   |   |   |-- README.md
|   |   |   |-- setup.py
|   |   |   |-- visJS2jupyter
|   |   |   `-- visJS2jupyter.egg-info
|   |   |-- vispy
|   |   |   |-- axes_plot.py
|   |   |   |-- display_lines.py
|   |   |   |-- ipython_fig_playground.py
|   |   |   |-- line_plot3d.py
|   |   |   |-- line_update.py
|   |   |   |-- plot.py
|   |   |   |-- scatter.py
|   |   |   |-- test.py
|   |   |   `-- Untitled.ipynb
|   |   |-- wavelets.R
|   |   |-- wavelets2.R
|   |   |-- widgets.ipynb
|   |   `-- x_auto_regression.ipynb
|   |-- pdf_processor
|   |   |-- interactive_pdf_chat.md
|   |   |-- interactive_pdf_chat.py
|   |   |-- pdf_chat_session.json
|   |   |-- pdf_folder_processor.py
|   |   |-- pdf_summaries.json
|   |   |-- pixi.lock
|   |   |-- pixi.toml
|   |   |-- README.md
|   |   |-- results_report.md
|   |   |-- results.json
|   |   |-- zotero_pdf_exporter.md
|   |   `-- zotero_pdf_exporter.py
|   |-- phdplanner
|   |   |-- download-pdfs-wayf.py
|   |   |-- download-pdfs.py
|   |   |-- find_selectors.py
|   |   |-- inspect_login.py
|   |   |-- inspect-wayf.py
|   |   |-- pixi.lock
|   |   |-- pixi.toml
|   |   |-- post_login_page.html
|   |   |-- test-aarhus-login.py
|   |   `-- wayf_page.html
|   |-- save_openio.sh
|   |-- scikit learn random forrest and gradient descent.webloc
|   |-- tmux-vscode
|   |   |-- launch-tmux.sh
|   |   |-- setup.sh
|   |   `-- tmux-project-vscode
|   |       |-- LICENSE
|   |       |-- Makefile
|   |       |-- node_modules
|   |       |-- out
|   |       |-- package-lock.json
|   |       |-- package.json
|   |       |-- pixi.lock
|   |       |-- pyproject.toml
|   |       |-- README.md
|   |       |-- resources
|   |       |-- src
|   |       |-- tmux-project-0.1.0.vsix
|   |       `-- tsconfig.json
|   |-- tslmm
|   |   |-- build
|   |   |   |-- bdist.macosx-11.0-arm64
|   |   |   `-- lib
|   |   |-- notebooks
|   |   |   |-- edge_and_node_r.ipynb
|   |   |   |-- edge_and_node.ipynb
|   |   |   |-- outputs
|   |   |   `-- prediction_example.ipynb
|   |   |-- pyproject.toml
|   |   |-- README.md
|   |   |-- tests
|   |   |   |-- __init__.py
|   |   |   |-- test_split.py
|   |   |   `-- test_tslmm.py
|   |   |-- tslmm
|   |   |   |-- __init__.py
|   |   |   |-- matrices.py
|   |   |   |-- operations.py
|   |   |   |-- simulations.py
|   |   |   |-- trace_estimators.py
|   |   |   |-- tslmm.py
|   |   |   `-- tspca.py
|   |   |-- tslmm.egg-info
|   |   |   |-- dependency_links.txt
|   |   |   |-- PKG-INFO
|   |   |   |-- requires.txt
|   |   |   |-- SOURCES.txt
|   |   |   `-- top_level.txt
|   |   `-- validation
|   |       |-- check_average_information.py
|   |       |-- check_conjugate_gradient_preconditioning.py
|   |       |-- check_genetic_values.py
|   |       |-- check_gradient_descent.py
|   |       |-- check_haseman_elston.py
|   |       |-- check_stochastic_ai_gradient.py
|   |       |-- check_stochastic_average_information.py
|   |       |-- check_stochastic_gradient.py
|   |       |-- check_trace_estimators.py
|   |       `-- figs
|   `-- vscode_theme_checker.py
|-- gene interaction screenshots
|   |-- Screenshot 2026-03-15 at 22.51.09.png
|   |-- Screenshot 2026-03-16 at 21.15.06.png
|   |-- Screenshot 2026-03-16 at 21.17.27.png
|   |-- Screenshot 2026-03-16 at 21.17.32.png
|   |-- Screenshot 2026-03-16 at 21.24.24.png
|   |-- Screenshot 2026-03-20 at 18.08.24.png
|   |-- Screenshot 2026-03-20 at 18.14.42.png
|   |-- Screenshot 2026-03-20 at 19.00.01.png
|   |-- Screenshot 2026-03-20 at 19.00.10.png
|   |-- Screenshot 2026-03-21 at 09.12.00.png
|   |-- Screenshot 2026-03-21 at 09.12.18.png
|   `-- Screenshot 2026-03-27 at 12.09.23.png
|-- Janne Auning - Autism cases in half siblings.docx
|-- Jotuns slides.pptx
|-- JUN gene.png
|-- lava_significant_annotated_v2.txt
|-- Leipzig-Awash-USB.pptx
|-- loaded_dice_IS_vs_BFFG.ipynb
|-- max_run.py
|-- Meritxell's paper
|   |-- Meritxell's paper.pdf
|   `-- Supplementary tables.xlsx
|-- Meritxell's paper.pdf
|-- Negative selection on baboon admixture is strongest on chromosome X(3).docx
|-- Notebooks
|   |-- 9606.protein.links.v11.0.txt
|   |-- Blackstyle.ipynb
|   |-- Bokeh.ipynb
|   |-- carlota.ipynb
|   |-- chrom_ideograms.ipynb
|   |-- circosplay
|   |-- Colors.ipynb
|   |-- crosswavelets.R
|   |-- CurveFitting.py
|   |-- custom_plugins.ipynb
|   |-- CytoscapeConfiguration
|   |-- data.py
|   |-- download_sample_data.py
|   |-- ete3_play.ipynb
|   |-- example.txt
|   |-- execute_notebook.sh
|   |-- female_chrx_decode_map_hg19.ipynb
|   |-- female.rmap
|   |-- fetchers.py
|   |-- fisher.ipynb
|   |-- gene_heat_graphs.ipynb
|   |-- gene_info.ipynb
|   |-- gene_lists.ipynb
|   |-- gene-report.csv
|   |-- ggtree.R
|   |-- grm.ipynb
|   |-- hiplot.ipynb
|   |-- horizonplot.R
|   |-- iker_chroms.ipynb
|   |-- image.html
|   |-- importance_sampling.ipynb
|   |-- Interact.ipynb
|   |-- ipyparallel.ipynb
|   |-- iPythonPlay.ipynb
|   |-- iris.html
|   |-- JupyterSlides.ipynb
|   |-- logsum.py
|   |-- london_plaques.png
|   |-- maps.R
|   |-- MCMC-sampling-for-dummies.ipynb
|   |-- Mixed_coalescent_densities.ipynb
|   |-- mpld3_demo.ipynb
|   |-- multiprocess_decorator.ipynb
|   |-- Multiprocessing.ipynb
|   |-- new_ideograms.R
|   |-- NpPresentPlay.ipynb
|   |-- PCA.ipynb
|   |-- PlayingWithSelection.ipynb
|   |-- plotly.ipynb
|   |-- Plotting_Maps.ipynb
|   |-- PlottingCookbook.ipynb
|   |-- PoolNielsen.ipynb
|   |-- PyPathway
|   |-- pyslim_tests.ipynb
|   |-- R_to_Python.ipynb
|   |-- RandPython.ipynb
|   |-- rasmus.ipynb
|   |-- rise.css
|   |-- sex-averaged.rmap
|   |-- sex-averaged.rmap.txt
|   |-- sliderPlugin.ipynb
|   |-- som.Rmd
|   |-- StationaryDistribution.ipynb
|   |-- sympy.ipynb
|   |-- template.ipynb
|   |-- template2.ipynb
|   |-- Thumbnails.ipynb
|   |-- tmp.vcf.gz
|   |-- umap.ipynb
|   |-- Untitled.ipynb
|   |-- Untitled1.ipynb
|   |-- Untitled2.ipynb
|   |-- Untitled3.ipynb
|   |-- Untitled4.ipynb
|   |-- vaex
|   |   `-- vaex
|   |       |-- ...
|   |       `-- vaex_play.ipynb
|   |-- vaex_jupyter.ipynb
|   |-- vaex.ipynb
|   |-- vcfparsing.ipynb
|   |-- view_high_c_with_vaex.ipynb
|   |-- visJS2jupyter
|   |-- vispy
|   |-- wavelets.R
|   |-- wavelets2.R
|   |-- widgets.ipynb
|   `-- x_auto_regression.ipynb
|-- notion_export.zip
|-- OMA REST API.yaml
|-- pairwise_dna_covariance_analysis.ipynb
|-- Screenshot 2026-07-16 at 21.34.23.png
|-- Screenshots
|   |-- ESHG pictures
|   |   |-- Screenshot 2026-06-18 at 11.27.47.png
|   |   |-- Screenshot 2026-06-18 at 11.27.53.png
|   |   `-- ...
|   |-- IMG_1759.heic
|   |-- IMG_1759.png
|   |-- Screenshot 2025-10-14 at 14.36.13.png
|   |-- Screenshot 2025-10-14 at 15.38.03.png
|   |   `-- ...
|   |-- Screenshot 2026-06-11 at 14.50.56.png
|   |-- Screenshot 2026-06-11 at 15.28.08.png
|   `-- Screenshots to sort
|       |-- chromatin_spermatogenesis_report.md
|       |-- KIS 241507 Opbevaringsboks Scubba Kan stables (B x H x T) 780 x 350 x 395 mm Grå-blå, Sort 1 stk køb….webloc
|       |-- Screen Recording 2025-12-10 at 10.44.12.mov
|   |   `-- ...
|-- Shannons trans-dist paper.docx
|-- SOM_copied.txt
|-- SOM_list.txt
|-- spermatid_X_autosome_homologs.xlsx
|-- X_autosome_homologs.xlsx
`-- y-haplo-trees
    |-- __pycache__
    |   |-- plot_tree.cpython-314.pyc
    |   `-- upgma.cpython-314.pyc
    |-- haplotypes_tree.ipynb
    |-- pixi.lock
    |-- pixi.toml
    |-- plot_tree.py
    `-- upgma.py

4982 directories, 746 files

```