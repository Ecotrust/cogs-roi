ogr2ogr -overwrite -sql \
  "select
    US_L3NAME                AS US_L3NAME,
    FIRST_US_L3CODE          AS FIRST_US_L,
    LandBirdHabitat_Index    AS LandBirdHa,
    LandBirdAbundance_Index  AS LandBirdAb,
    ShorebirdHabitat_Index   AS ShorebirdH,
    ShoreBirdAbundance_Index AS ShoreBirdA,
    WaterbirdHabitat_Index2  AS WaterbirdH,
    WaterbirdAbundance_Index AS WaterbirdA,
    WaterfowlHabitat_Index   AS WaterfowlH,
    WaterfowlAbundance_Index AS WaterfowlA,
    TEAmphib_Index           AS TEAmphib_I,
    TEBirds_Index            AS TEBirds_In,
    TEFishes_Index           AS TEFishes_I,
    TEMammals_Index          AS TEMammals_,
    TEPlants_Index           AS TEPlants_I,
    TEReptiles_Index         AS TEReptiles,
    ROI_Index                AS ROI,
    CurExpenditure_Index     AS CurExpendi,
    ClimateChange_Index      AS ClimateCha,
    Development_Index        AS Developmen,
    Range_MIN                AS Range_MIN,
    Range_MAX                AS Range_MAX,
    Range_MEAN               AS Range_MEAN,
    Ag_MIN                   AS Ag_MIN,
    Ag_MAX                   AS Ag_MAX,
    Ag_MEAN                  AS Ag_MEAN,
    Pasture_MIN              AS Pasture_MI,
    Pasture_MAX              AS Pasture_MA,
    Pasture_MEAN             AS Pasture_ME,
    Forest_MIN               AS Forest_MIN,
    Forest_MAX               AS Forest_MAX,
    Forest_MEAN              AS Forest_MEA,
    All_MIN                  AS All_MIN,
    All_MAX                  AS All_MAX,
    All_MEAN                 AS All_MEAN,
    TE_EOSpecies_Index       AS TE_Index
   from EcoSums_ForMatt
   left join 'original/ROI_Table_Jan26.gdb.zip'.ROITable
   on EcoSums_ForMatt.FIRST_US_L3CODE = ROITable.FIRST_US_L3CODE" \
   ecoregions_joined_albers.shp original/EcoregionSummaries3.gdb.zip EcoSums_ForMatt
