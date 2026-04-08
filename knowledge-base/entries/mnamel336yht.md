![Screenshot 2025-11-18 at 11.20.00.png](images/mnamf2f3_Screenshot_2025-11-18_at_11.20.00.png)

**Figure 6. Haplotype-specific features of X chromosome inactivation (XCI)**. 

**a)** Schematic of culture-derived XCI skewing. 

**b)** Chromosome-wide comparison between percent actuation of the paternal (Xa) and maternal (Xi) haplotypes at each FIRE peak in LCL cells (GM12878). Pseudoautosomal regions (PAR1 & PAR2) are highlighted in orange and gray, respectively. **c)** Counts of FIRE peaks categorized as Xa-specific, Xi-specific, or Shared between both haplotypes for LCL (top) and fibroblast cells (bottom). FIRE elements are stratified by their location within or outside of PAR1 (left), and non-PAR1 elements are further subsetted to those that overlap a CTCF site (middle) or TSS (right). 

**d)** Scatterplot of LCL Fiber-seq percent actuation on the Xi (x-axis) and Xa (y-axis) for each TSS. Points are colored by XCI escape annotations from previous studies (65). 

**e)** UBA1 promoter region comparing full-length transcript reads, scATAC-seq, CTCF ChIP-seq, mCpG, FIRE percent actuation, FIRE peaks, and representative Fiber-seq reads from the paternal (Xa) and maternal (Xi) haplotypes in LCLs (GM12878). 

**f)** Scatterplot of Fiber-sea percent actuation on the Xi in LCL (x-axis) and fibroblast (y-axis) cells. Points are colored as in panel d. 

**g)** The average number of escaping non-TSS FIRE peaks in LCL (left) and fibroblast (right) cells by absolute distance from TSSs. Counts are displayed separately for escaping TSSs (top, purple) and inactivated TSSs (bottom, blue). 

**h)** Full-length LCL transcript expression differences between the Xa and Xi for genes phased by Fiber-seq and displayed in d. Count differences are displayed as log2 fold-change between the haplotypes. Genes are stratified by the Fiber-seq classifications of their TSS FIRE peaks as in c. 

**i)** The number of escaping LCL non-TSS FIRE peaks within 5 Kb of each TSS in the shared category in h. Shared TSSs were grouped into high or low log2 fold-change in expression, highlighted with blue and purple in h (*p[=10.04031; one-sided Wilcoxon rank sum test).

## Make an ideogram (hg37) with superloop archs and all the other X chrom annotation:

*A 3D Map of the Human Genome at Kilobase Resolution Reveals Principles of Chromatin Looping*

https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE63525

The pipeline uses BWA (Li and Durbin, 2010) to map each read end separately to the **b37** or mm9 reference genomes;

**GSE63525_GM12878_HiCCUPS_chrX_superloop_list.txt**

***Loop Annotation Files:***

Under the main Series Record (GSE63525), there are files named *_HiCCUPS_looplist.txt.gz or *_HiCCUPS_looplist_with_motifs.txt.gz, where * represents each of the cell types analyzed in this study (GM12878, HMEC, HUVEC, HeLa, IMR90, K562, KBM7, NHEK, CH12-LX), as well as biological replicate annotations for GM12878 (GM12878_primary and GM12878_replicate). These files contain Juicebox-loadable (www.aidenlab.org/juicebox) loop annotations returned by our loop calling algorithm, HiCCUPS (see Fig. 3, the Experimental Procedures, and Section VI.a.5 of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014). These files contain a header line, followed by a line for every loop. The files named *_HiCCUPS_looplist.txt.gz contain 20 fields per line in the following format:

chromosome1    x1    x2    chromosome2    y1    y2    color    observed    expected_bottom_left    expected_donut    expected_horizontal    expected_vertical    fdr_bottom_left    fdr_donut    fdr_horizontal    fdr_vertical    number_collapsed    centroid1    centroid2    radius

Explanations of each field are as follows:

chromosome = the chromosome that the loop is located on

x1,x2 = the coordinates of the upstream locus corresponding to the peak pixel (see the Experimental Procedures and VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014 for a definition of the peak pixel)

y1,y2 = the coordinates of the downstream locus corresponding to the peak pixel (see the Experimental Procedures and VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014 for a definition of the peak pixel)

color = the color that the feature will be rendered as if loaded in Juicebox (www.aidenlab.org/juicebox)

observed = the raw observed counts at the peak pixel (see the Experimental Procedures and VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014 for a definition of the peak pixel)

expected_[bottom_left, donut, horizontal, vertical] = the expected counts calculated using the [bottom_left, donut, horizontal, vertical] filter (see Figure 3 and section VI.a.5.i of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)

fdr_[bottom_left, donut, horizontal, vertical] = the q-value of the loop calculated using the [bottom_left, donut, horizontal, vertical] filter (see VI.a.5.ii of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)

number_collapsed = the number of pixels that were clustered together as part of the loop call (see section VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)

centroid1 = the upstream coordinate of the centroid of the cluster of pixels corresponding to the loop (see section VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)

centroid2 = the downstream coordinate of the centroid of the cluster of pixels corresponding to the loop (see section VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)

radius = the Euclidean distance from the centroid of the cluster of pixels to the farthest pixel in the cluster of pixels (see section VI.a.5.iv of the Extended Experimental Procedures of Rao, Huntley, et al., Cell 2014)