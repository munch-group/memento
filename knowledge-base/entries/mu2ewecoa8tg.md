- Clean up chr3 notebook in geneinfo repo

---------------------------------------------------------------------------

# Find repos:

    find ~/ -name '.git' -maxdepth 5 -type d -not -path '**/github-backup/**' -exec dirname {} \;

    find -L . -maxdepth 6 -user kmt -name '.git' -type d -not -path '**/.pixi/**' -exec dirname {} \; 2>&1 | grep -v 'Permission denied' | grep -v 'Too many levels of symbolic links'

# Local:

- `~/baboons`: Sort out unholy mix of notebooks and a subdir with eriks notebooks

# Cluster:

- `./pratt_et_al/IBDmix`: Admixture from Humans into Nanderthals (or lack of)
- `./xy-brain/people/kmt/y-strat-gwas`: Prototype Y-strat analysis
- `./gpn`: Attempt to make gwf workflow for gpn
- `./Birds/faststorage/people/kmt/bird-hotspots`: Hotspots across bird orders
- `./xy-drive/people/kmt/hic-spermatogenesis`: Sørens macaque analysis
- `./xy-drive/people/kmt/hic-xy-sperm`: My adaptation of Sørens xy sperm analysis
- `./primatediversity/people/kmt/interference_map`: Old interference_map code
- `./primatediversity/people/kmt/baboon_flagship`: My own code supplementing Erik's contributions to the Science paper
- `./primatediversity/people/kmt/baboons_v3_calling`: Folder for new calling of baboons (Move its contents to new project with same name)


- `./primatediversity/people/kmt/primate-prot-var`: Need to clean up what is in here:

primate-prot-var is a research analysis repo, not a software package. It compares protein-coding variation across primates by combining human population data (gnomAD, VEP, AlphaMissense) with primate ortholog alignments and baboon population genomics. It runs on GenomeDK with SLURM and uses pixi environments.

Main content

scripts/: standalone Python scripts, each described in scripts/README.md and the root README.md.
- gnomAD: primate_aa_variants.py finds common missense variants. gnomad-optimized-pipeline.py and the other gnomad-* scripts get predicted loss-of-function (LoF) variants for all human genes.
- AlphaMissense: alphamissense_downloader.py downloads the data, build_alpha_missense_hdf5.py builds an HDF5 lookup file, and annotate_var.py queries it.
- Alignments: get_alignments.py builds codon-aware primate ortholog alignments with MACSE.
- Baboon (papAnu4): sgkit_workflow.py builds Zarr stores and extract_variants.py reads variants from them.
- Old VEP pipeline: vep_sbatch.sh and vcf2parquet.py have been replaced by the gwf workflow.

long-read-lof/ (19 GB): the largest and most active part. It intersects primate gene-loss data from TOGA (Senckenberg), Mao et al. 2024 and Yoo et al. 2025 with human 1000 Genomes long-read structural variants. The main scripts are intersect_primate_lof.py, merge_loss_matrices.py, annotate_sv_lof.py and run_toga_walk.sh. Outputs in results/ are loss/status matrices and intersections as TSV and Parquet, with separate chrX versions. It has its own CLAUDE.md, README.md and METHODS.md.

notebooks/: TTLL10.ipynb (a single-gene case study, also rendered as TTLL10.html), lof.ipynb, vep.ipynb and example.ipynb. There is also a notebooks/vep_data/ folder with parquet/ and vcf/ subfolders.

Data and outputs (not tracked in git)

- data/ (5.6 GB): the AlphaMissense TSV and Parquet files, the baboon papAnu4 genome (FASTA plus RefSeq/refGene GTFs), and TTLL10.gtf.
- results/: gnomAD common-missense CSVs, plus gnomad_lof/, which holds six timestamped LoF runs from 5–6 Dec 2025 (probably reruns you could clean up).
- steps/: alignments/ and alpha_missense_hg38.h5.
- gnomad_cache/, logs/: cache and log files.




# Remove later

- `xy-drive/people/kmt/cDEGexploration`: Remove when laptop version is tidied up
- `xy-brain/people/kmt/cDEGexploration`: Remove when laptop version is tidied up

Remove/move notebooks at /home/kmt/xy-drive/people/kmt that are not in cDEGexploration




# Clean up Science stuff on Desktop
