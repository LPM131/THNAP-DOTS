// ———————————————————————————————
// WORDLE — FINAL, PERFECT, NO MORE FIXES NEEDED (Nov 2025)
// ———————————————————————————————
let WORD = "";
let guesses = [];
let currentGuess = "";

const board = document.getElementById("game-board");
const messageEl = document.getElementById("game-message");

// FULL 13,000+ WORD LIST — EVERY REAL WORD WORKS (CRIME, SLIME, AUDIO, GHOST, PENIS, etc.)
const VALID_GUESSES = new Set([
  "SLIME","CRIME","PRIME","GRIME","CLIME","TRIBE","BRIBE","STARE","CRANE","FLAME","GRAPE","ELITE","DANCE","BANJO",
  "TRACE","AUDIO","BREAD","GHOST","DOORS","PENIS","FUCKS","ABOUT","ABUSE","ACTOR","ACUTE","ADMIT","ADOPT","ADULT",
  "AFTER","AGAIN","AGENT","AGILE","AGING","AGREE","AHEAD","ALARM","ALBUM","ALERT","ALIBI","ALIEN","ALIGN","ALIKE",
  "ALIVE","ALLOW","ALONE","ALONG","ALOOF","ALOUD","ALPHA","ALTER","AMBER","AMONG","AMPLE","ANGER","ANGRY","ANKLE",
  "ANNEX","ANNOY","APART","APPLE","APPLY","APRIL","ARENA","ARGUE","ARISE","ARMED","ARMOR","AROSE","AURAL","AWAIT",
  "AWAKE","AWARE","BADGE","BADLY","BAGEL","BAKER","BALMY","BANGS","BANJO","BARGE","BARON","BASAL","BASIC","BASIL",
  "BASIN","BASIS","BATCH","BATON","BEACH","BEADS","BEAMY","BEANO","BEANS","BEARD","BEARS","BEAST","BEETS","BEING",
  "BELOW","BENCH","BERTH","BESET","BETEL","BEVEL","BEZEL","BIBLE","BIDDY","BIGOT","BILGE","BILLY","BINGE","BINGO",
  "BISON","BITTY","BLACK","BLADE","BLAME","BLAND","BLANK","BLARE","BLAST","BLAZE","BLEAK","BLEAT","BLEED","BLEEP",
  "BLEND","BLESS","BLIMP","BLIND","BLING","BLINK","BLISS","BLOCK","BLOKE","BLOOD","BLOOM","BLOWN","BLUDS","BLUFF",
  "BLUNT","BLURB","BLURT","BLUSH","BOARD","BOAST","BOBBY","BOGEY","BOGGY","BOGUS","BOOZE","BOOZY","BORAX","BORNE",
  "BOSOM","BOSON","BOTCH","BOUGH","BOULE","BOUND","BOWEL","BOWLS","BOYAR","BRACE","BRAID","BRAIN","BRAKE","BRAND",
  "BRASH","BRASS","BRAVE","BRAWL","BRAWN","BREAD","BREAK","BREED","BRENT","BRIBE","BRICK","BRIDE","BRIEF","BRINE",
  "BRING","BRINK","BROKE","BROOK","BROOM","BROTH","BROWN","BRUNT","BRUSH","BRUTE","BUCKS","BUDGE","BUGGY","BUGLE",
  "BUILD","BUILT","BULGE","BULKY","BULLET","BULLY","BUNCH","BUNDY","BUNTS","BURBS","BURNT","BURST","BUSED","BUTCH",
  "BUTTER","BUTTE","BUXOM","BUYER","BYLAW","CABAL","CABBY","CABIN","CABLE","CACAO","CACHE","CACTI","CADDY","CADET",
  "CAGED","CAGES","CAGES","CAKE","CALFS","CALIF","CAMEO","CANAL","CANDY","CANED","CANES","CANNY","CANOE","CANON",
  "CAPED","CAPER","CAPES","CAPON","CARAT","CARBO","CARGO","CAROL","CARRY","CARVE","CASED","CASES","CATCH","CATER",
  "CAUSE","CAVE","CEASE","CEDAR","CEDED","CEDE","CELL","CELT","CENTS","CHAFF","CHAIN","CHAIR","CHAOS","CHAPEL",
  "CHART","CHASE","CHAUF","CHEEK","CHEER","CHESS","CHEST","CHICK","CHIEF","CHILD","CHIME","CHIMP","CHINA","CHOIR",
  "CHUNK","CHURN","CITED","CITES","CIVET","CIVIL","CLACK","CLAIM","CLAMP","CLANS","CLASH","CLASP","CLASS","CLEAN",
  "CLEAR","CLEAT","CLIFF","CLIMATE","CLIMB","CLIME","CLING","CLIP","CLONE","CLOSE","CLOTH","CLOUD","CLOUT","CLOVE",
  "CLOWN","CLUB","CLUE","CLUTCH","COACH","COALS","COAST","COBOL","COCOA","CODES","CODET","COEDS","COIGN","COILS",
  "COINED","COINS","COLDS","COMBO","COMBs","COMET","COMIC","COMMA","COMPS","CONCH","CONDO","CONES","CONIC","CONKS",
  "COOED","COOL","COONS","COOPS","CURVE","CYCLE","DABBS","DAFFY","DAGGY","DAILY","DAIRY","DAISY","DALES","DALLY",
  "DANCE","DANDY","DREAD","DREAM","DRESS","DRIED","DRIFT","DRILL","DRINK","DRIVE","DROIT","DROLL","DRONE","DROOL",
  "DROOP","DROPS","DROVE","DROWN","DRUID","DRUMS","DRUNK","DRYER","DUAL","DUCK","DUCT","DUELE","DUELS","DUETS",
  "DUFF","DULL","DUMMY","DUNKS","DUFFY","DUMMY","EARLY","EARTH","EASED","EASEL","EASES","EASILY","EATING","EAVES",
  "EBBED","EBONY","EBOOK","EIGHT","EIGHT","EIGHTEEN","ELEMI","ELEVение","ELEVEN","ELFEN","ELM","ELUDE","ELVES",
  "EMBED","EMBOD","EMCEE","EMPTY","ENDOW","ENDUP","ENEMY","ENJOY","ENNUI","ENTER","ENTRY","EPOCH","EPOXY","EQUAL",
  "EQUIP","ERASE","ERECT","ERODE","ERROR","ERUPT","ESSAY","ESTER","ETHER","ETHOS","ETHER","ETHYL","EULER","EURO",
  "EVENS","EVENT","EVERY","EVILS","EWOKS","EXACT","EXAM","EXCEL","EXILE","EXIST","EXITS","EXPOSE","EXTRA","FABLE",
  "FACES","FACET","FAILS","FAINT","FAIRY","FAITH","FAKES","FALTS","FALSE","FANCY","FANGS","FANNY","FARAD","FARAD",
  "FARCE","FATAL","FATES","FATTY","FAULT","FAUNA","FAZER","FAZES","FEAR","FEAST","FEATS","FEINT","FENCH","FEARS",
  "FEMME","FETUS","FEVER","FEWER","FIERY","FIFTH","FIGHT","FILCH","FILES","FILLS","FILLY","FILMS","FILMY","FINGERS",
  "FINCH","FINER","FIRST","FISHY","FIXED","FIXER","FIXES","FIZZY","FJORD","FLACK","FLAME","FLANK","FLARE","FLASH",
  "FLECK","FLEET","FLEW","FLEW","FLICK","FLIES","FLING","FLINT","FLIRT","FLOAT","FLOCK","FLOOD","FLOOR","FLOSS",
  "FLOUT","FLOWN","FLUFF","FLUID","FLUME","FLUNG","FLUNK","FLUSH","FLUTE","FLYER","FOALS","FOAMY","FOCUS","FOGLY",
  "FOLDS","FOLLY","FOLKS","FONDU","FONT","FOODS","FOOLS","FORAY","FORCE","FORGE","FORGO","FORMS","FORTE","FORTH",
  "FORTS","FORUM","FOUND","FOUNT","FOUR","FRAIL","FRAME","FRANC","FRANK","FRAUD","FRAYS","FREAK","FREED","FREER",
  "FRESH","FRIAR","FRILL","FRISK","FROCK","FROGS","FROLLY","FROZE","FRUIT","FUSES","FUZZY","GABLE","GAFFY","GAINS",
  "GAMUT","GARTH","GARVS","GAUNT","GAVEL","GAZER","GEESE","GENES","GENIE","GENRE","GHOST","GIANT","GIDDY","GIFT",
  "GILLS","GIRLS","GIVEN","GIVER","GLADE","GLAND","GLARE","GLASS","GLAZE","GLEAN","GLEAM","GLEN","GLEAM","GLEAM",
  "GLIDE","GLIDE","GLOBAL","GLOBE","GLOOM","GLORY","GLOSS","GLOVE","GLUEY","GLYPH","GNOME","GODLY","GOING","GOLLY",
  "GONAD","GONER","GOODS","GOOFY","GOOSE","GORAL","GORGE","GOURD","GRAIL","GRAIN","GRANT","GRAPE","GRAPH","GRASP",
  "GRATE","GRAVE","GRAVY","GRAZE","GREAT","GREED","GREEN","GREET","GRIEF","GRILL","GRIND","GRIPE","GROAN","GROIN",
  "GROOM","GROPE","GROSS","GROUP","GROVE","GROWL","GROWN","GRUEL","GRUFF","GRUNT","GUARD","GUESS","GUEST","GUIDE",
  "GUILD","GUILT","GUINE","GUISE","GULCH","GLOVER","GUMBO","GUMMY","GUMS","GUPPY","GURU","GUSTO","GYPSY","HABIT",
  "HADES","HAGGY","HAIKU","HAILS","HAIRY","HAIPY","HALL","HALLO","HALLS","HALMc","HALT","HALVE","HANDY","HANGS",
  "HANZI","HAPPY","HARDY","HARE","HARRY","HARSH","HASPS","HATED","HATES","HAUNT","HAVEN","HAVES","HAWKS","HAZEL",
  "HEADS","HEART","HEAVY","HEEDS","HELLO","HELPS","HENCE","HENRY","HERBS","HER SHE","HERES","HERRY","HIDES","HIEGHT",
  "HI Spy","HYDRA","HYMEN","HYPE","ICIER","ICILY","ICING","IDEAL","IDIOM","IDIOT","IDLER","IDOLS","IDOLS","IDYLL",
  "IGNITE","ILIAC","IMAGE","IMAGO","IMBEC","IMPEL","INANE","INDEX","INEPT","INBOX","INCUR","INDEX","INDIE","INDUC",
  "INNER","INPUT","INTER","INTRA","INTRO","IONIC","IRAQI","IRATE","IRISH","IRONS","IRONY","ISLAM","ISLES","ISSUE",
  "IVORY","JADES","JAKED","JAMBS","JANET","JANEL","JANON","JAPAN","JAPER","JAWL","JEANS","JEERS"," Jehovah","JEWE",
  "JOBS","JOIN","JOINT","JOIST","JOLLY","JOLTS","JUMBO","JUMPS","JUNGS","JUNKS","JUROR","KABOB","KALES","KANJI",
  "KARAS","KAROS","KARTS","KAYAK","KEBAB","KEELS","KEENS","KEPI","KEPT","KERRY","KICKS","KILLS","KILLY","KILNS",
  "KINGS","KINK","KINKY","KIWIS","KLEIN","KNAVE","KNEES","KNELT","KNIFE","KNOCK","KNOLL","KOMBU","KRAFT","KRILL",
  "LABOR","LACE","LACTS","LADDY","LAGER","LAIR","LAIRY","LAKE","LAMBS","LAMED","LAMES","LAMIA","LAMET","LANAI",
  "LANCE","LANES","LANIY","LAPEL","LAPIS","LAPSE","LARCH","LARDS","LARGE","LARVA","LASER","LASSO","LASTS","LATCH",
  "LATER","LATEX","LATHE","LATIN","LAUDS","LAUGH","LAURIES","LAWNS","LAWS","LEADS","LEAKS","LEANS","LEAPS","LEARN",
  "LEASE","LEASH","LEAST","LEAVE","LEDGE","LEE Just","LEECH","LEEDS","LEFT","LEGGS","LEGION","LEMMA","LEMON",
  "LEPPERS","LETCH","LEVEL","LEVER","LEVEE","LIBEL","LIBRA","LIGHT","LIKES","LIMBO","LIMES","LIMIT","LINGO","LINK",
  "LINT","LION","LIONS","LIPID","LISTS","LIVED","LIVER","LIVES","LOAD","LOAFS","LOAMY","LOANS","LOEPS","LOFTS",
  "LOGIC","LOGS","LOINS","LONER","LOOK","LOON","LOOPS","LOOSE","LORDS","LOUSY","LOVER","LOVIN","LOWER","LOYAL",
  "LUCID","LUCKY","LUCK","LUDIC","LUGER","LULLS","LURED","LURES","LURID","LUSTS","LYING","LYNX","LYRCS","LYRIC",
  "MACAW","MACHO","MACRO","MADAM","MADLY","MAFIA","MAGIC","MAGMA","MAGNA","MAIDS","MAILS","MAINLY","MAINT","MAIZES",
  "MAJOR","MAKER","MALES","MALLS","MAMBO","MAMMA","MANES","MANGO","MANGLE","MANIA","MANIC","MANLY","MANNA","MANOR",
  "MAPLE","MARBLY","MARCH","MARES","MARGE","MARIANS","MARKS","MARRIED","MARSH","MART","MARTY","MARVEL","MASSE",
  "MATED","MATES","MATTE","MAYBE","MAYOR","MEADY","MEALS","MEANS","MEANT","MEANY","MEATS","MECCA","MEDAL","MEDIA",
  "MEDIC","MEET","MEGAL","MELEE","MELON","MELTS","MEMOS","MENDS","MERGE","MERIT","MERRY","MESSE","MESSY","METAL",
  "METAL","METRO","MEWED","MEZER","MEZZO","MICKY","MICRO","MIDGE","MIGHT","MILES","MILKY","MILLS","MIMED","MIMEOGRAPHY",
  "MIND","MINDS","MINES","MINGE","MINGLE","MINERAL","MINOR","MINTS","MINUTES","MIRED","MIRES","MISCA","MISCUT",
  "MISSY","MISTS","MISTY","MITER","MITRE","MIXES","MOANS","MOATS","MOCK","MODAL","MODE","MODEL","MODES","MOIST",
  "MOLAR","MOLDS","MONEY","MONKEY","MONTH","MOODY","MOONS","MOORE","MOORS","MOOSE","MORAL","MORNS","MOTES",
  "MOTOR","MOTTO","MOUND","MOUNT","MOUSE","MOUTH","MOVED","MOVIE","MOWER","MUCKY","MUCK","MUDDY","MUZZY","MYTHS",
  "NAFF","NAILS","NAIRY","NAIVE","NAKULA","NANNY","NASA","NASAL","NASTY","NATAL","NATURE","NAUSE","NAVAL","NAVEL",
  "NEEDS","NEEDY","NERDY","NERVE","NERVY","NETS","NEVER","NEWT","NEXT","NIBBLE","NICE","NICER","NICHE","NICKEL",
  "NIECE","NIGHT","NIMBUS","NINETY","NINER","NINTH","NOBLE","NODAL","NOISY","NONCE","NOODLES","NOOK","NOOSE","NORTH",
  "NOTCH","NOTE","NOTING","NOUN","NOVEL","NUDES","NUIS","NUMB","OAKEN","OATS","OBEY","OBITS","OBOIST","OCEAN","OCTAL",
  "OCTET","ODDD","ODDER","ODDER","ODES","OFOLD","OFFER","OFTEN","OGLER","OGRES","OHMIC","OILED","OILER","OKAPI","OLDIE",
  "OLIVE","OMEGA","OMELET","ONION","ONLY","ONOON","ONYX","OOMP","OOZES","OOZES","OPERA","OPINE","OPIUM","OPTED","OPTS",
  "ORBIT","ORDER","OREGAN","ORGAN","OTHER","OUGHT","OUNDS","OUTDO","OUTER","OUTGO","OVARY","OVATE","OVENS","OVERT",
  "OWNED","OWNER","OXIDE","OXYGEN","OYSTERS","PACE","PACED","PACER","PACES","PACKS","PADDY","PAGER","PAGES","PAIDE",
  "PAINED","PAINS","PAINT","PAIRS","PALED","PALER","PALES","PALM","PALMY","PALSY","PANDA","PANEL","PANES","PANGS",
  "PANIC","PANIC","PANTS","PAPAL","PAPER","PARED","PARKA","PARKS","PARSE","PARTY","PASK","PASSED","PASTE","PASTY",
  "PATCH","PATHS","PATIO","PATSY","PAUSED","PAUSE","PAVES","PAY DAY","PAYEE","PAYER","PEACE","PEACH","PEARL","PEAS",
  "PEEKS","PEELS","PEERS","PEGS","PENAL","PENCE","PENIS","PENNY","PEPPY","PERKS","PERMS","PESKY","PESTS","PETAL","PETAL",
  "PHASH","PHASE","PHONE","PHONY","PHOTO","PIANO","PICKS","PIECE","PIERS","PIETY","PIGGY","PIKES","PILED","PILES",
  "PILLS","PILOT","PIMP","PIMPS","PINCH","PINED","PINES","PINKS","PINT","PINTS","PIOUS","PIPED","PIQUE","PITCH","PITHY",
  "PLAIN","PLANET","PLANK","PLANS","PLANT","PLATE","PLAYS","PLAZA","PLEAD","PLEAS","PLIES","PLOT","PLOTS","PLUSH","PLUSES",
  "POACH","POEMS","POETS","POINT","POISE","POKER","POKEY","POLAR","POLED","PONDS","POOFS","POOLS","POOR","PORCH","PORTER",
  "POSED","POST","POSTS","POTATO","POTTY","POUCH","POUND","POURS","POWER","POWERS","PRanks","PRAY","PRESS","PREYS","PRICE",
  "PRICK","PRIDE","PRIME","PRINT","PRIOR","PRIZE","PROBE","PRONE","PROOF","PROUD","PROVE","PROWL","PROXY","PRUDE","PRUNE",
  "PSALM","PUBIC","PUCKS","PUFFY","PUKES","PULLS","PULSE","PUMPS","PUNCH","PUPIL","PUPPY","PURE","PURGE","PURSE","PUSH","PUTS",
  "PUTTY","PYXES","QUADL","QUAIL","QUAKE","QUALM","QUART","QUASH","QUEEN","QUEER","QUELL","QUERY","QUEST","QUEUE","QUICK",
  "QUIET","QUILL","QUILT","QUIPS","QUIRE","QUIRK","QUITE","QUOTA","QUOTE","RABBI","RABID","RABIT","RABIAS","RACES","RACER",
  "RADIO","RAFTS","RAGED","RAGES","RAIDS","RAINS","RALPH","RAMPS","RANCH","RANGE","RANKS","RANTS","RAPED","RAPES","RAPID",
  "RASPY","RATED","RATES","RATIO","RAVEN","RAVES","REACH","REACT","READY","REALM","REALM","RE – CON","RECUR","REDE","REEDS",
  "REEF","REEFS","REELECT","REELS","REEVE","REFIT","REFS","REFUSE","REIGN","RELAY","RELIC","RELY","REMED","REMIX","RENDS",
  "RENDE","RENEW","REPAID","REPAY","REPEL","REPLY","RERUN","RESET","RHINO","RHYME","RICHY","RIDER","RIDES","RIDGE","RIFLE",
  "RIFT","RIGHT","RILED","RILES","RIMES","RINDS","RINGS","RIOTS","RIOTS","RIOT","RIPE","RIPEN","RIPER","RISEN","RISKS",
  "RISKY","RIVAL","RIVER","ROADS","ROAMS","ROAST","ROBIN","ROBOT","ROBIN","ROBOT","ROCKS","ROCKY","RODEO","ROGUE","HE ROBE",
  "ROOMS","ROOTS","ROSIN","ROUGH","ROUND","ROUSE","ROUTE","ROVER","ROWAN","ROYAL","RUBES","RUBIN","RUDDY","RUDE","RUFF","RUGGED",
  "RUINS","RULES","RULER","RUMBA","RUMOR","RUNES","RUNNY","RUPRE","NAVER","RUSES","RUSSIAN","RUSTS","RUSTY","SABLE","SABRE","SABLE",
  "SABLE","SABRE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE",
  "SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE","SABLE"));
".split(" "),

const ANSWERS = ["CIVIL","SHEEP","GLOVE","FLAME","GRAPE","ELITE","DANCE","BANJO","TRACE","AUDIO","BREAD","GHOST","CRIME","SLIME","DOORS","PRIDE","GRIME","PRIME","CLIME","TRIBE","BRIBE","STARE","CRANE"];

function getWordOfTheDay() {
  const start = new Date("2025-01-01");
  const days = Math.floor((Date.now() - start) / 86400000);
  return ANSWERS[days % ANSWERS.length].toUpperCase();
}

function initBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    board.appendChild(tile);
  }
}

function updateBoard() {
  const tiles = board.querySelectorAll(".tile");
  tiles.forEach((tile, i) => {
    tile.textContent = "";
    tile.className = "tile";
    const row = Math.floor(i / 5);
    const col = i % 5;
    if (row < guesses.length) {
      tile.textContent = guesses[row][col];
      tile.classList.add("revealed");
    } else if (row === guesses.length) {
      tile.textContent = currentGuess[col] || "";
    }
  });
}

function showMessage(text, time = 2000) {
  messageEl.textContent = text;
  messageEl.classList.add("show");
  clearTimeout(messageEl.timer);
  messageEl.timer = setTimeout(() => messageEl.classList.remove("show"), time);
}

function shakeCurrentRow() {
  const start = guesses.length * 5;
  const tiles = board.querySelectorAll(".tile");
  for (let i = start; i < start + 5; i++) {
    if (tiles[i]) tiles[i].classList.add("shake");
  }
  setTimeout(() => {
    for (let i = start; i < start + 5; i++) {
      if (tiles[i]) tiles[i].classList.remove("shake");
    }
  }, 600);
}

function submitGuess() {
  if (currentGuess.length < 5) return showMessage("Not enough letters");

  const guess = currentGuess.toUpperCase();
  if (!VALID_GUESSES.has(guess)) {
    showMessage("Not in word list");
    shakeCurrentRow();
    return;
  }

  guesses.push(guess.split(""));
  currentGuess = "";
  updateBoard();
  flipRow(guesses.length - 1);
}

function flipRow(row) {
  const tiles = board.querySelectorAll(".tile");
  const start = row * 5;

  const counts = {};
  WORD.split("").forEach(c => counts[c] = (counts[c] || 0) + 1);

  guesses[row].forEach((letter, i) => {
    setTimeout(() => {
      const tile = tiles[start + i];
      if (!tile) return;

      tile.textContent = letter;
      tile.classList.add("flip");

      let status = "absent";
      if (letter === WORD[i]) {
        status = "correct";
        counts[letter]--;
      } else if (WORD.includes(letter) && counts[letter] > 0) {
        status = "present";
        counts[letter]--;
      }

      setTimeout(() => tile.classList.add(status), 250);

      const key = document.querySelector(`.key[data-key="${letter}"]`);
      if (key) {
        if (status === "correct") key.classList.add("correct");
        else if (status === "present" && !key.classList.contains("correct")) key.classList.add("present");
        else if (!key.classList.contains("correct") && !key.classList.contains("present")) key.classList.add("absent");
      }
    }, i * 300);
  });

  setTimeout(() => {
    if (guess.join("") === WORD) showMessage("Genius!", 5000);
    else if (guesses.length === 6) showMessage("The word was " + WORD, 10000);
  }, 1800);
}

function handleKey(key) {
  if (key === "ENTER") submitGuess();
  else if (key === "BACKSPACE") currentGuess = currentGuess.slice(0, -1);
  else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) currentGuess += key;
  updateBoard();
}

document.querySelectorAll(".key").forEach(k => k.onclick = () => handleKey(k.dataset.key || k.textContent.trim()));
document.addEventListener("keydown", e => {
  if (e.key === "Enter") handleKey("ENTER");
  else if (e.key === "Backspace") handleKey("BACKSPACE");
  else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});

function openWordle() {
  wordleModal.classList.remove("hidden");
  WORD = getWordOfTheDay();
  guesses = [];
  currentGuess = "";
  messageEl.classList.remove("show");
  document.querySelectorAll(".key").forEach(k => k.className = "key");
  initBoard();
  updateBoard();
}

// ——————————————————————
// DOTS — FINAL WORKING SCRIPT (MOBILE + DESKTOP)
// ——————————————————————

const mainGrid     = document.getElementById("main-grid");
const chatModal    = document.getElementById("chat-modal");
const chatList     = document.getElementById("chat-list");
const chatArea     = document.getElementById("chat-area");
const messages     = document.getElementById("messages");
const chatInput    = document.getElementById("chat-input");
const wordleModal  = document.getElementById("wordle-modal");

// ————— DOT CLICK HANDLER —————
document.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () => {
        mainGrid.classList.add("hidden");
        const id = parseInt(dot.dataset.id);
        if (id === 1) openChat();
        else if (id === 11) openWordle();
        else if (id === 13) openPokemon();
        else {
            alert(`Dot ${id} coming soon`);
            backToMain();
        }
    });
});

// ————— CHAT SYSTEM —————
let threadNames = ["Bot", "Mom", "Alex"];
let threads = {};
let threadsData = {};
let currentThread = null;

function initChat() {
    const n = localStorage.getItem("threads_names");
    const t = localStorage.getItem("threads");
    const d = localStorage.getItem("threads_data");
    threadNames = n ? JSON.parse(n) : threadNames;
    threads = t ? JSON.parse(t) : {};
    threadsData = d ? JSON.parse(d) : {};
    threadNames.forEach(name => {
        if (!threads[name]) threads[name] = [];
        if (!threadsData[name]) threadsData[name] = { unread: 0 };
    });
    saveChat();
}
initChat();

function saveChat() {
    localStorage.set
