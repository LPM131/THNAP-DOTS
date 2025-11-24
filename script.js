// ————————————————
// MOBILE VIEWPORT HEIGHT FIX — CRITICAL FOR iOS SAFARI
// ————————————————
// Fix vh units for iOS Safari when keyboard appears/disappears
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial set
setVH();

// Update on resize and orientation change
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// Update when focus changes (keyboard detection)
let height = window.innerHeight;
window.addEventListener('focusin', () => {
  setTimeout(() => setVH(), 100);
});
window.addEventListener('focusout', () => {
  setTimeout(() => setVH(), 100);
});

// ———————————————————————————————
// WORDLE — FINAL WORKING VERSION (Nov 2025)
// ———————————————————————————————
let WORD = "";
let guesses = [];
let currentGuess = "";

const board = document.getElementById("game-board");
const messageEl = document.getElementById("game-message");
const wordleModal = document.getElementById("wordle-modal");
const mainGrid = document.getElementById("main-grid");

const VALID_GUESSES = new Set([
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADMIT", "ADULT", "AFTER", "AGAIN", "AGENT", "ALIEN", "ALLOW", "ALONE", "ALONG", "ALOUD", "ALPHA",
  "ALTER", "AMBER", "AMONG", "AMPLE", "ANGER", "ANGRY", "ANKLE", "ANNEX", "ANNOY", "APART", "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE",
  "ARMOR", "AROSE", "AURAL", "AWAIT", "AWAKE", "AWASH", "AUDIO", "AUDIT", "AWADE", "AWAVE", "AWARE", "AZURE",
  // Adding missing common words that players expect to work:
  "CRANE", "SLATE", "TRACE", "RAISE", "STARE", "PRIDE", "BRIDE", "PRIME", "CLIME", "TRIBE", "BRIBE", "STARE", "GRAPE", "CRIME", "SLIME", "GRIME",
  "BACON", "BADGE", "BADLY",
  "BAKER", "BALDY", "BANJO", "BEACH", "BEADS", "BEAMY", "BEANS", "BEARD", "BEAST", "BEING", "BELOW", "BENCH", "BERTH", "BESET", "BETEL",
  "BEVEL", "BEZEL", "BIBLE", "BIDDY", "BIGOT", "BILGE", "BINGE", "BISON", "BITTY", "BLACK", "BLADE", "BLAME", "BLAND", "BLAST", "BLEAK",
  "BLEAT", "BLEED", "BLEEP", "BLESS", "BLIMP", "BLIND", "BLING", "BLINK", "BLISS", "BLOCK", "BLOKE", "BLOOD", "BLOOM", "BLOWN", "BLUFF",
  "BLUNT", "BOARD", "BOAST", "BOBBY", "BOGEY", "BOGGY", "BOGUS", "BOOZE", "BOOZY", "BORAX", "BORNE", "BOSOM", "BOTCH", "BOUGH", "BOUND",
  "BOWEL", "BRACE", "BRAID", "BRAIN", "BRAKE", "BRAND", "BRASH", "BRASS", "BRAVE", "BREAD", "BREAK", "BREED", "BRENT", "BRIBE", "BRICK",
  "BRIDE", "BRIEF", "BRINE", "BRING", "BRINK", "BROKE", "BROOK", "BROOM", "BROTH", "BROWN", "BRUNT", "BRUSH", "BRUTE", "BUCKS", "BUDGE",
  "BUGGY", "BUGLE", "BUILD", "BUILT", "BULGY", "BULKY", "BUNCH", "BURNT", "BURST", "CABAL", "CABBY", "CABIN", "CABLE", "CACAO", "CACHE",
  "CACTI", "CADDY", "CADET", "CAGED", "CAKES", "CALIF", "CAMEO", "CANAL", "CANDY", "CAPED", "CAPER", "CAPES", "CARAT", "CARGO", "CAROL",
  "CARRY", "CARVE", "CASED", "CATCH", "CATER", "CAUSE", "CEASE", "CEDAR", "CELL", "CENTS", "CHAFF", "CHAIN", "CHAIR", "CHAOS", "CHARM",
  "CHASE", "CHAUF", "CHEEK", "CHEER", "CHESS", "CHEST", "CHICK", "CHIEF", "CHILD", "CHILI", "CHIME", "CHIMP", "CHIPS", "CHIRP", "CHOCK",
  "CHOIR", "CHOKE", "CHORD", "CHORE", "CHOSE", "CHUCK", "CHUMP", "CHUNK", "CHURN", "CIVIL", "CLAMP", "CLASP", "CLASS", "CLEAN", "CLEAR",
  "CLEAT", "CLIFF", "CLIMB", "CLOAK", "CLOCK", "CLOUT", "CLOWN", "CLUCK", "CLUED", "CLUMP", "COACH", "COALS", "COAST", "COCOA", "CODEC",
  "COLON", "COMBO", "COMES", "COMIC", "COMMA", "CONDO", "CONE", "CONIC", "COOKS", "CROWS", "CROWN", "CRUDE", "CRUEL", "CRUMB", "CRUSH",
  "CRUST", "CRYPT", "CUBIC", "CUMIN", "CUPID", "CURVY", "CYCLE", "CYNIC", "DADDY", "DAILY", "DAIRY", "DAISY", "DANCE", "DANDY", "DATUM",
  "DAUNT", "DEARS", "DEATH", "DEBT", "DEBUT", "DECAF", "DECAL", "DECAY", "DECOR", "DECRY", "DEFER", "DEIGN", "DELIS", "DELTA", "DELVE",
  "DEMON", "DEMOS", "DENTS", "DEPOT", "DEPTH", "DERBY", "DETER", "DETOX", "DEUCE", "DEVIL", "DIARY", "DOING", "DOLLY", "DONOR", "DONUT",
  "DOPEY", "DOUBT", "DOUSE", "DOVER", "DOZEN", "DRAFT", "DRAIN", "DRAKE", "DRAMA", "DRANK", "DRAPE", "DRAWN", "DREAD", "DREAM", "DRESS",
  "DRIED", "DRIFT", "DRILL", "DRINK", "DRIVE", "DROVE", "DROWN", "DRUID", "DRUMS", "DRUNK", "DRYER", "DUALS", "DUCKS", "DUCTS", "DUFFS",
  "DULLS", "DUMMY", "DUNKS", "DUNCE", "DUSKY", "DUSTY", "DUTCH", "DWARF", "DWELL", "DYING", "EARLY", "EARTH", "EASED", "EASEL", "EASES",
  "EATEN", "EATER", "EBBED", "EBONY", "EBOOK", "ECHOS", "ECLAT", "EDGED", "EDGES", "EDICT", "EDIFY", "EDITS", "EERIE", "EGGED", "EGRET",
  "EIDER", "EIGHT", "EJECT", "EKING", "ELBOW", "ELDER", "ELECT", "ELEGY", "ELIDE", "ELITE", "ELOPE", "ELUDE", "ELVES", "EMAIL", "EMBED",
  "EMBER", "EMCEE", "EMPTY", "ENDOW", "ENNUI", "ENTER", "ENTRY", "ENVOY", "EOSIN", "EPICS", "EPOCH", "EPOXY", "EQUAL", "EQUIP", "ERASE",
  "ERECT", "ERODE", "ERROR", "ERUPT", "ESSAY", "ESTER", "ETHER", "ETHIC", "ETHOS", "EVADE", "EVENT", "EVERY", "EVICT", "EVOKE", "EXACT",
  "EXALT", "EXAMS", "EXCEL", "EXERT", "EXILE", "EXIST", "EXITS", "EXPEL", "EXTOL", "EXTRA", "FABLE", "FACED", "FACER", "FACES", "FACET",
  "FACTS", "FADED", "FADER", "FADES", "FAILS", "FAINT", "FAIRS", "FAIRY", "FAITH", "FAKED", "FAKER", "FAKES", "FALSE", "FAMED", "FANCY",
  "FANGS", "FANNY", "FARCE", "FARED", "FARES", "FARMS", "FARTS", "FASTS", "FATAL", "FATED", "FATES", "FATTY", "FAULT", "FAUNA", "FAVOR",
  "FEAST", "FECAL", "FEIGN", "FENCE", "FERAL", "FERRY", "FETAL", "FETCH", "FETID", "FETUS", "FEVER", "FEWER", "FIATS", "FIBER", "FICHE",
  "FIELD", "FIEND", "FIERY", "FIFTH", "FIGHT", "FILED", "FILER", "FILES", "FILLY", "FILMS", "FILMY", "FILTH", "FINAL", "FINCH", "FINDS",
  "FINED", "FINER", "FINES", "FIRST", "FISHY", "FIXED", "FIXER", "FIXES", "FJORD", "FLABS", "FLACK", "FLAGS", "FLAIL", "FLAIR", "FLAKE",
  "FLAME", "FLANK", "FLARE", "FLASH", "FLASK", "FLATS", "FLAWS", "FLAYS", "FLEAS", "FLECK", "FLEES", "FLEET", "FLESH", "FLEWS", "FLICK",
  "FLIER", "FLIES", "FLING", "FLINT", "FLIPS", "FLIRT", "FLITS", "FLOAT", "FLOCK", "FLOGS", "FLOOD", "FLOOR", "FLOPS", "FLORA", "FLOSS",
  "FLOUT", "FLOWN", "FLOWS", "FLUBS", "FLUED", "FLUES", "FLUFF", "FLUID", "FLUKE", "FLUNG", "FLUNK", "FLUSH", "FLUTE", "FLYER", "FOALS",
  "FOAMS", "FOAMY", "FOCAL", "FOCUS", "FOGEY", "FOGGY", "FOYLE", "FOILS", "FOIST", "FOLDS", "FOLIA", "FOLLY", "FONDS", "FOODS", "FOOLS",
  "FOOTY", "FORAY", "FORCE", "FORDS", "FORGE", "FORGO", "FORKS", "FORM", "FORTE", "FORTH", "FORTS", "FORTY", "FORUM", "FOUGH", "FOUND",
  "FOUNT", "FOURS", "FOXED", "FOXES", "FOYER", "FRAIL", "FRAME", "FRANC", "FRANK", "FRAUD", "FRAYS", "FREAK", "FREED", "FREER", "FREES",
  "FRESH", "FRIAR", "FRIED", "FRIER", "FRIES", "FRILL", "FRISK", "FROCK", "FROGS", "FROWN", "FRUIT", "FUCKS", "FUCK", "FUDGY", "FUELS",
  "FUGAL", "FUGUE", "FULLY", "FUNDI", "FUNDS", "FUNGI", "FUNKY", "FUNNY", "FURLS", "FURRY", "FURZE", "FUSED", "FUSSY", "FUTON", "FUZZY",
  "GABLE", "GAFFY", "GAILY", "GAINS", "GAMED", "GAMER", "GAMMA", "GAMPS", "GAMUT", "GANEF", "GANGS", "GANJA", "GARBS", "GARDA", "GARDE",
  "GARNI", "GARTH", "GASES", "GASPY", "GASSY", "GATES", "GATED", "GATER", "GAUDY", "GAUZE", "GAUZY", "GAZER", "GEEKS", "GEEKY", "GEESE",
  "GEEST", "GELDS", "GELID", "GEMMA", "GEMMY", "GENES", "GENIE", "GENII", "GENOA", "GENRE", "GENTS", "GENUA", "GENUS", "GEODE", "GEOID",
  "GERMS", "GERMY", "GETUP", "GHEES", "GHOST", "GHOUL", "GIANT", "GIBES", "GIDDY", "GIFTS", "GIGAS", "GILLS", "GILLY", "GIMEL", "GIMPY",
  "GINKS", "GINNY", "GISTS", "GITES", "GIUST", "GIVEN", "GIVER", "GIVES", "GIZMO", "GLADE", "GLAND", "GLARE", "GLASS", "GLAZY", "GLEAM",
  "GLEAN", "GLEBE", "GLEES", "GLENS", "GLENT", "GLEYS", "GLIAL", "GLIDE", "GLIFF", "GLINT", "GLITZ", "GLOAT", "GLOBE", "GLOOM", "GLORY",
  "GLOSS", "GLOVE", "GLOWN", "GLOWS", "GLOZE", "GLUED", "GLUES", "GLUEY", "GLUGS", "GLUME", "GLUMS", "GLUTE", "GLYPH", "GNARL", "GNARS",
  "GNASH", "GNATS", "GNOME", "GOING", "GOLDS", "GOLLY", "GONAD", "GONER", "GOODS", "GOODY", "GORED", "GORES", "GORKS", "GORMS", "GORSE",
  "GORSY", "GOSHT", "GOTHS", "GOTTA", "GOUGE", "GOURA", "GOOSE", "GORGY", "GOURD", "GOUTS", "GOUTY", "GOYLE", "GRABS", "GRACE", "GRADE",
  "GRAFT", "GRAIL", "GRAIN", "GRAND", "GRANT", "GRAPE", "GRAPH", "GRASS", "GRATE", "GRAVE", "GRAVY", "GRAZE", "GREAT", "GREED", "GREEN",
  "GREET", "GRIEF", "GRILL", "GRIMY", "GRIND", "GRIPE", "GROAN", "GROIN", "GROOM", "GROPE", "GROSS", "GROUP", "GROVE", "GROWL", "GROWN",
  "GRUEL", "GRUFF", "GRUNT", "GUARD", "GUAVA", "GUESS", "GUEST", "GUIDE", "GUILD", "GUILE", "GUILT", "GUISE", "GULCH", "GULLY", "GUMBO",
  "GUMMY", "GUMPS", "GUPPY", "GURUS", "GUSTO", "GUSTY", "GYPSY", "HABIT", "HADES", "HAIRY", "HAIRY", "HALLS", "HAPPY", "HAPPY", "HARDY",
  "HAREM", "HARRY", "HARSH", "HASTE", "HASTY", "HATCH", "HATER", "HAUNT", "HAUTE", "HAVEN", "HAVOC", "HAZEL", "HEADS", "HEART", "HEATH",
  "HEAVE", "HEAVY", "HEDGE", "HEFTY", "HEIST", "HELIX", "HELLO", "HENCE", "HENCH", "HENRY", "HERBS", "HERRY", "HIDES", "HIGHT", "HIRED",
  "HIRES", "HITCH", "HOARD", "HOBBY", "HOIST", "HOLLY", "HOMER", "HONEY", "HONOR", "HORDE", "HORNY", "HORSE", "HOTEL", "HOUSE", "HOVEL",
  "HOVER", "HUMAN", "HUMOR", "HUMPH", "HUMUS", "HUNCH", "HUNKY", "HURRY", "HUSKY", "HUTCH", "HYDRA", "HYENA", "HYMEN", "HYPER", "ICILY",
  "ICING", "IDEAL", "IDIOM", "IDIOT", "IDLER", "IDYLL", "IGNIS", "ILIAC", "IMAGE", "IMBUE", "IMPEL", "INANE", "INDEX", "INEPT", "INERT",
  "INFER", "INGOT", "INLAY", "INLET", "INNER", "INPUT", "INTER", "INTRA", "INTRO", "IONIC", "IRAQI", "IRATE", "IRISH", "ISSUE", "ITCHY",
  "IVORY", "JAUNT", "JAZZY", "JELLY", "JERKY", "JETTY", "JEWEL", "JIFFY", "JOINT", "JOIST", "JOKER", "JOLLY", "JOUST", "JUDGE", "JUICE",
  "JUICY", "JUMBO", "JUMPY", "JUNTA", "JUNTO", "JUROR", "KALES", "KARMA", "KAYAK", "KEBAB", "KHAKI", "KILLY", "KILNS", "KINGS", "KINKY",
  "KIWIS", "KLUTZ", "KNOCK", "KNOLL", "KNOWN", "KOALA", "KRAFT", "KRAUT", "KRILL", "LABOR", "LACED", "LAFER", "LAGER", "LAIRD", "LAKES",
  "LAMBS", "LANCE", "LANDS", "LAPEL", "LAPSE", "LARCH", "LARGE", "LARVA", "LASER", "LASSO", "LASTS", "LATCH", "LATER", "LATEX", "LATHE",
  "LATIN", "LAUGH", "LAYER", "LEACH", "LEADS", "LEAKS", "LEANS", "LEAPS", "LEARN", "LEASE", "LEASH", "LEAST", "LEAVE", "LEDGE", "LEECH",
  "LEERY", "LEFTY", "LEGAL", "LEGGY", "LEMON", "LEMUR", "LENDS", "LEPER", "LEVEL", "LEVER", "LIBEL", "LIEGE", "LIGHT", "LIKEN", "LILAC",
  "LIMBO", "LIMIT", "LINEN", "LINER", "LINGO", "LISTS", "LIVED", "LIVER", "LIVES", "LLAMA", "LOADS", "LOAMY", "LOATH", "LOBBY", "LOCAL",
  "LOCUS", "LODGE", "LOFTY", "LOGIC", "LOGS", "LOOPS", "LOOSE", "LORRY", "LOSER", "LOUSE", "LOUSY", "LOVER", "LOWER", "LOYAL", "LUCID",
  "LUCKY", "LUMEN", "LUMPY", "LUNAR", "LUNCH", "LUNGE", "LUPUS", "LURCH", "LURID", "LUSTY", "LYING", "LYMPH", "LYNCH", "LYRIC", "MACAW",
  "MACHO", "MACRO", "MADAM", "MADLY", "MAFIA", "MAGIC", "MAGMA", "MAIZE", "MAJOR", "MAKER", "MALES", "MALLS", "MAMBO", "MAMMA", "MANES",
  "MANGO", "MANIA", "MANIC", "MANLY", "MANNA", "MANOR", "MAPLE", "MARCH", "MARRY", "MARSH", "MASON", "MASSE", "MATCH", "MATEY", "MAUVE",
  "MEADS", "MEALS", "MEALY", "MEANT", "MEANT", "MEANT", "MEATY", "MECCA", "MEDIA", "MEDIC", "MELEE", "MELON", "MERGE", "MERIT", "MERRY",
  "METAL", "METER", "METRO", "MEZZO", "MICRO", "MIDGE", "MIDST", "MIGHT", "MILKY", "MILLS", "MIMIC", "MINCE", "MINER", "MINIM", "MINOR",
  "MINTY", "MINUS", "MIRTH", "MISER", "MISSY", "MISTY", "MITER", "MITRE", "MIXED", "MIXER", "MOANS", "MOATS", "MOCK", "MODAL", "MODEL",
  "MODES", "MOIST", "MOLAR", "MONEY", "MONKS", "MONTH", "MOODY", "MOOED", "MOOSE", "MORAL", "MORAN", "MORON", "MORPH", "MOSSY", "MOTEL",
  "MOTIF", "MOTOR", "MOVED", "MOVIE", "MOWER", "MUCKY", "MUCUS", "MUDDY", "MULCH", "MUMMY", "MUNCH", "MURAL", "MURKY", "MUSHY", "MUSIC",
  "MUSKY", "MUSTY", "MYRRH", "NADIR", "NAIVE", "NAMMY", "NASAL", "NASTY", "NATAL", "NAVAL", "NAVEL", "NEEDS", "NEEDY", "NERDY", "NERVE",
  "NEVER", "NEWLY", "NICER", "NICHE", "NIECE", "NIGHT", "NIMBLE", "NINJA", "NINTH", "NOBLE", "NOBLY", "NOISE", "NOISY", "NONCE", "NOOSE",
  "NORTH", "NOTCH", "NOTED", "NOVEL", "NUDGE", "NUDGE", "NYLON", "NYMPH", "OAKEN", "OBESE", "OCCUR", "OCEAN", "OCTAL", "OCTET", "ODDLY",
  "OFFER", "OFTEN", "OILED", "OLDEN", "OLDER", "OLIVE", "OMBRE", "OMEGA", "ONION", "ONSET", "OPERA", "OPINE", "OPIUM", "OPTED", "ORBAN",
  "ORDER", "OREGO", "ORGAN", "OTHER", "OUGHT", "OUNCE", "OUTDO", "OUTER", "OUTGO", "OVARY", "OVATE", "OVERT", "OWING", "OWNED", "OWNER",
  "OXIDE", "OXYGEN", "OYSTER", "PACE", "PACED", "PACER", "PACES", "PACKS", "PADDY", "PAGER", "PAGES", "PAIDS", "PAILS", "PAINT", "PAIRS",
  "PALED", "PALER", "PALES", "PALM", "PALMY", "PANDA", "PANEL", "PANES", "PANGS", "PANIC", "PANTS", "PAPER", "PARER", "PARKA", "PARKS",
  "PARSE", "PARTY", "POTATO", "POTTY", "POUCH", "POUND", "POUTS", "POWER", "PRANK", "PRAWN", "PREEN", "PRESS", "PRICE", "PRICK", "PRIDE",
  "PRIED", "PRIME", "PRIMO", "PRINT", "PRIOR", "PRISE", "PRIVY", "PRIZE", "PROBE", "PRONE", "PRONG", "PROOF", "PROSE", "PROUD", "PROVE",
  "PROWL", "PROXY", "PRUDE", "PRUNE", "PSALM", "PUBLIC", "PUCKS", "PUFFY", "PUKES", "PULLS", "PULSE", "PUMPS", "PUNCH", "PUPAL", "PUPIL",
  "PUPPY", "PUREE", "PURGE", "PURSE", "PUSHY", "PUTTY", "PYGMY", "QUAIL", "QUAKE", "QUALM", "QUART", "QUASH", "QUEEN", "QUEER", "QUELL",
  "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUILL", "QUILT", "QUIRK", "QUITE", "QUOTA", "QUOTE", "RABBI", "RABID", "RABIT", "RACES",
  "RACER", "RADAR", "RADII", "RADIO", "RAFTS", "RAGED", "RAGES", "RAIDS", "RAINS", "RALPH", "RAMPS", "RANCH", "RANDY", "RANGE", "RAPID",
  "RASPY", "RATED", "RATES", "RATIO", "RAVEN", "RAVES", "REACH", "REACT", "READY", "REALM", "REBAR", "REBEL", "REBUS", "RECUR", "RECUF",
  "REDER", "REDID", "REEL", "REEVE", "REFIT", "REFS", "REFUSE", "REIGN", "RELAY", "RELIC", "RELY", "REMED", "REMIX", "RENDS", "RENEG",
  "RENEW", "REPAID", "REPAY", "REPEL", "REPLY", "RERAN", "RERUN", "RESET", "RESIN", "RETRY", "RETURN", "REVEL", "REVUE", "RHINO", "RHYME",
  "RICHY", "RIDER", "RIDES", "RIDGE", "RIFLE", "RIFT", "RIGHT", "RILED", "RILES", "RIMES", "RINDS", "RINGS", "RIOTS", "RIPEN", "RIPER",
  "RISEN", "RISER", "RISKY", "RIVAL", "RIVEN", "RIVER", "RIVET", "ROACH", "ROAST", "ROBIN", "ROBOT", "ROCKY", "RODEO", "ROGER", "ROGUE",
  "ROLES", "ROLLS", "ROMAN", "ROMEO", "ROMP", "ROOST", "ROTOR", "ROUGE", "ROUGH", "ROUND", "ROUSE", "ROUTE", "ROVER", "ROWDY", "ROWER",
  "ROYAL", "RUBBE", "RUBBER", "RUBES", "RUBIN", "RUDDY", "RUDE", "RUFF", "RUGBY", "RUINS", "RULES", "RULER", "RUMBA", "RUMOR", "RUNES",
  "RUNNY", "RURAL", "RUSTY", "SABLE", "SABRE", "SADLY", "SAFER", "SAINT", "SALAD", "SALLY", "SALON", "SALSA", "SALTY", "SALVE", "SALVO",
  "SANDY", "SANER", "SAPPY", "SARGE", "SASSY", "SATIN", "SATYR", "SAUCE", "SAUCY", "SAUNA", "SAUTE", "SAVOR", "SAVOY", "SAVVY", "SCALD",
  "SCALE", "SCALP", "SCALY", "SCAMP", "SCANT", "SCARE", "SCARF", "SCARP", "SCARY", "SCENE", "SCEPT", "SCION", "SCOFF", "SCOLD", "SCONE",
  "SCOOP", "SCOOT", "SCOPE", "SCORE", "SCORN", "SCOUR", "SCOUT", "SCOWL", "SCRAM", "SCRAP", "SCREE", "SCREW", "SCRUB", "SCRUM", "SCUBA",
  "SEDAN", "SEEDY", "SEEK", "SEEM", "SEGUE", "SEIZE", "SEMEN", "SENSE", "SEPIA", "SERIF", "SERUM", "SERVE", "SETUP", "SEVEN", "SEVER",
  "SEWER", "SHACK", "SHADE", "SHADY", "SHAFT", "SHAKE", "SHAKY", "SHALE", "SHALL", "SHAME", "SHANK", "SHAPE", "SHARD", "SHARE", "SHARK",
  "SHARP", "SHAVE", "SHAWL", "SHEAR", "SHEEN", "SHEEP", "SHEER", "SHEET", "SHEIK", "SHELF", "SHELL", "SHIED", "SHIFT", "SHINE", "SHINY",
  "SHIPS", "SHIRE", "SHIRK", "SHIRT", "SHOAL", "SHOCK", "SHONE", "SHOOK", "SHOOT", "SHORE", "SHORN", "SHORT", "SHOUT", "SHOVE", "SHOWN",
  "SHOWY", "SHRED", "SHREW", "SHRUG", "SHUCK", "SHUNT", "SHUSH", "SHYER", "SHYLY", "SIEGE", "SIEVE", "SIGHT", "SIGMA", "SILKY", "SILLY",
  "SILTY", "SINCE", "SINEW", "SINGE", "SIREN", "SIXTH", "SIXTY", "SJAMB", "SKATE", "SKIER", "SKIFF", "SKILL", "SKIMP", "SKIRT", "SKULK",
  "SKULL", "SKUNK", "SLACK", "SLAIN", "SLANG", "SLANT", "SLASH", "SLATE", "SLAVE", "SLEEK", "SLEEP", "SLEET", "SLEPT", "SLICE", "SLICK",
  "SLIDE", "SLIME", "SLIMY", "SLING", "SLINK", "SLOOP", "SLOPE", "SLOSH", "SLOTH", "SLUMP", "SLUNG", "SLUNK", "SLURP", "SLUSH", "SLYLY",
  "SMACK", "SMALL", "SMART", "SMASH", "SMEAR", "SMELL", "SMELT", "SMILE", "SMIRK", "SMITE", "SMITH", "SMOCK", "SMOKE", "SMOKY", "SMOTE",
  "SNACK", "SNAIL", "SNAKE", "SNAKY", "SNARE", "SNARL", "SNEAK", "SNEER", "SNIDE", "SNIFF", "SNIPE", "SNOOP", "SNORE", "SNORT", "SNOUT",
  "SNOWY", "SNUCK", "SNUFF", "SOBER", "SOCCER", "SOCKS", "SODDY", "SOFTY", "SOLAR", "SOLID", "SOLVE", "SONAR", "SONIC", "SOOTH", "SOOTY",
  "SORRY", "SOUND", "SOUTH", "SOWER", "SPACE", "SPADE", "SPANK", "SPARE", "SPARK", "SPASM", "SPAWN", "SPEAK", "SPEAR", "SPECK", "SPEED",
  "SPELL", "SPELT", "SPEND", "SPENT", "SPERM", "SPICE", "SPICY", "SPIED", "SPIEL", "SPIKE", "SPIKY", "SPILL", "SPILT", "SPINE", "SPINY",
  "SPIRE", "SPITE", "SPITZ", "SPLAT", "SPLIT", "SPOIL", "SPOKE", "SPOOF", "SPOOK", "SPOOL", "SPOON", "SPORE", "SPORT", "SPOUT", "SPRAY",
  "SPREE", "SPRIG", "SPUNK", "SPURN", "SPURT", "SQUAD", "SQUAT", "SQUIB", "STACK", "STAFF", "STAGE", "STAID", "STAIN", "STAIR", "STAKE",
  "STALE", "STALK", "STALL", "STAMP", "STAND", "STANK", "STARE", "STARK", "START", "STASH", "STATE", "STAVE", "STEAD", "STEAK", "STEAL",
  "STEAM", "STEED", "STEEL", "STEEP", "STEER", "STEIN", "STERN", "STICK", "STIFF", "STILL", "STILT", "STING", "STINK", "STINT", "STOCK",
  "STOIC", "STOKE", "STOLE", "STOMP", "STONE", "STONY", "STOOD", "STOOL", "STOOP", "STORE", "STORK", "STORM", "STORY", "STOUT", "STOVE",
  "STRAP", "STRAW", "STRAY", "STRUT", "STUCK", "STUDY", "STUFF", "STUMP", "STUNG", "STUNK", "STUNT", "STYLE", "SUAVE", "SUGAR", "SUING",
  "SUITE", "SULKY", "SULLY", "SUMAC", "SUNNY", "SUPER", "SURGE", "SURLY", "SUSHI", "SWAMI", "SWAMP", "SWARM", "SWASH", "SWATH", "SWEAR",
  "SWEAT", "SWEEP", "SWEET", "SWELL", "SWEPT", "SWIFT", "SWILL", "SWINE", "SWING", "SWIPE", "SWIRL", "SWISH", "SWOON", "SWOOP", "SWORD",
  "SWORE", "SWORN", "SWUNG", "SYRUP", "TABOO", "TACIT", "TACKY", "TAFFY", "TAINT", "TAKEN", "TAKER", "TALLY", "TALON", "TAMER", "TANGO",
  "TANGY", "TAPIR", "TARDY", "TAROT", "TASTE", "TATTY", "TAUNT", "TAWNY", "TEACH", "TEARY", "TEASE", "TEDDY", "TEETH", "TELCO", "TEMPO",
  "TENET", "TENOR", "TENSE", "TENTH", "TEPEE", "TERRA", "TERSE", "TESTY", "THANK", "THEFT", "THEIR", "THEME", "THERE", "THESE", "THETA",
  "THICK", "THIEF", "THIGH", "THINE", "THING", "THINK", "THIRD", "THONG", "THORN", "THOSE", "THREE", "THREW", "THROB", "THROW", "THRUM",
  "THUMB", "THUMP", "THYME", "TIARA", "TIBIA", "TIDAL", "TIGER", "TIGHT", "TILDE", "TILER", "TILTH", "TIMER", "TIMID", "TIPPY", "TIRED",
  "TITAN", "TITHE", "TITLE", "TOAST", "TODDY", "TOFFY", "TOGGLE", "TOILE", "TOKEN", "TONAL", "TONGA", "TONIC", "TOOTH", "TOPAZ", "TOPIC",
  "TORCH", "TORSO", "TORUS", "TOTAL", "TOTEM", "TOUCH", "TOUGH", "TOWEL", "TOWER", "TOXIC", "TOXIN", "TRACE", "TRACT", "TRADE", "TRAIL",
  "TRAIN", "TRAIT", "TRAMP", "TRASH", "TRAWL", "TREAD", "TREAT", "TREND", "TRIAD", "TRIAL", "TRIBE", "TRICE", "TRICK", "TRIED", "TRIER",
  "TRIPE", "TRITE", "TROLL", "TROOP", "TROPE", "TROUT", "TROVE", "TRUCE", "TRUCK", "TRUER", "TRULY", "TRUMP", "TRUNK", "TRUSS", "TRUST",
  "TRUTH", "TRUST", "TRYST", "TUBAL", "TUBER", "TULIP", "TULLE", "TUMID", "TUMMY", "TUMOR", "TUNIC", "TUNNY", "TUTOR", "TUTTI", "TUTU",
  "TUXED", "TWANG", "TWEAK", "TWEED", "TWEET", "TWERK", "TWICE", "TWINE", "TWING", "TWINK", "TWIRL", "TWIST", "TWIXT", "TYING", "UDDER",
  "ULCER", "ULTRA", "UMBRA", "UNCLE", "UNCUT", "UNDER", "UNDID", "UNDUE", "UNFED", "UNFIT", "UNIFY", "UNION", "UNITE", "UNITY", "UNLIT",
  "UNMET", "UNSET", "UNTIE", "UNTIL", "UNTO", "UNWED", "UNZIP", "UPEND", "UPPER", "UPSET", "URBAN", "URINE", "USAGE", "USHER", "USING",
  "USUAL", "USURP", "UTILE", "UTTER", "VAGUE", "VALET", "VALID", "VALOR", "VALUE", "VALVE", "VAPID", "VAPOR", "VAULT", "VAUNT", "VEEPY",
  "VEGAN", "VEGET", "VEINY", "VELDT", "VENAL", "VENOM", "VENTS", "VENUE", "VERGE", "VERSE", "VERSO", "VERVE", "VETCH", "VEXED", "VIAL",
  "VICAR", "VIDEO", "VIEW", "VIGIL", "VIGOR", "VILLA", "VINYL", "VIOL", "VIOLE", "VIOLA", "VIPER", "VIRAL", "VIRUS", "VISIT", "VISOR",
  "VISTA", "VITAL", "VIVID", "VIXEN", "VOCAL", "VODKA", "VOGUE", "VOICE", "VOILA", "VOMIT", "VOTER", "VOUCH", "VOWEL", "VYING", "WACKO",
  "WAFER", "WAGER", "WAGON", "WAIST", "WAIVE", "WALTZ", "WARTY", "WASTE", "WATCH", "WATER", "WAVER", "WAXEN", "WEARY", "WEAVE", "WEDGE",
  "WEEDY", "WEIGH", "WEIRD", "WELCH", "WELSH", "WENCH", "WHACK", "WHALE", "WHARF", "WHEAT", "WHEEL", "WHELP", "WHERE", "WHICH", "WHIFF",
  "WHILE", "WHINE", "WHINY", "WHIRL", "WHISK", "WHITE", "WHOLE", "WHOOP", "WHORE", "WHOSE", "WHOSO", "WIDEN", "WIDER", "WIDOW", "WIDTH",
  "WIELD", "WIGHT", "WILCO", "WILDS", "WILLY", "WIMPY", "WINCE", "WINCH", "WINDS", "WINDY", "WIPER", "WIRED", "WITCH", "WITTY", "WOKEN",
  "WOMAN", "WOMEN", "WOODY", "WOOER", "WOOLY", "WOOZY", "WORDY", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WOUND", "WOVEN",
  "WOWED", "WRACK", "WRATH", "WREAK", "WRECK", "WREST", "WRIED", "WRIER", "WRING", "WRIST", "WRITE", "WRONG", "WROTE", "WRUNG", "WRYLY",
  "YACHT", "YAHBO", "YANKY", "YARNS", "YAWED", "YAWLS", "YAWNS", "YEARN", "YEAST", "YIELD", "YODEL", "YOKED", "YOKEL", "YOLKY", "YOU'RE",
  "YOUTH", "YUCCA", "YUMMY", "ZAPPY", "ZESTY", "ZILCH", "ZINC", "ZIPPY", "ZONAL", "ZONED", "ZONER", "ZONES", "ZOOM"
]);

const ANSWERS = ["CIVIL","SHEEP","GLOVE","FLAME","GRAPE","ELITE","DANCE","BANJO","TRACE","AUDIO","BREAD","GHOST","CRIME","SLIME","DOORS","PRIDE","GRIME","PRIME","CLIME","TRIBE","BRIBE","STARE","CRANE","PENIS"];

function isValidGuess(word) {
  return VALID_GUESSES.has(word.toUpperCase());
}

function getWordOfTheDay() {
  const start = new Date("2025-01-01");
  const days = Math.floor((new Date() - start) / 86400000);
  return ANSWERS[days % ANSWERS.length];
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
    const row = Math.floor(i / 5);
    const col = i % 5;
    tile.textContent = "";
    tile.className = "tile";

    if (row < guesses.length) {
      tile.textContent = guesses[row][col];
      tile.classList.add("revealed");
    } else if (row === guesses.length) {
      tile.textContent = currentGuess[col] || "";
    }
  });
}

function showMessage(text, duration = 2000) {
  messageEl.textContent = text;
  messageEl.classList.remove("show");

  // Force reflow
  void messageEl.offsetWidth;

  messageEl.classList.add("show");

  clearTimeout(messageEl.hideTimeout);
  messageEl.hideTimeout = setTimeout(() => {
    messageEl.classList.remove("show");
  }, duration);
}

function shakeCurrentRow() {
  const tiles = board.querySelectorAll(".tile");
  const start = guesses.length * 5;
  for (let i = start; i < start + 5; i++) {
    if (tiles[i]) {
      tiles[i].classList.add("shake");
      setTimeout(() => tiles[i]?.classList.remove("shake"), 600);
    }
  }
}

function submitGuess() {
  if (currentGuess.length < 5) {
    showMessage("Not enough letters");
    return;
  }

  const guess = currentGuess.toUpperCase();

  if (!isValidGuess(guess)) {
    showMessage("Not in word list");
    shakeCurrentRow();
    return;
  }

  guesses.push(guess);
  currentGuess = "";
  animateRow(guesses.length - 1, guess);
}

function handleKey(key) {
  if (key === "BACKSPACE" || key === "BACK") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (key === "ENTER") {
    submitGuess();
  } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
    currentGuess += key;
  }
  updateBoard();
}

document.querySelectorAll(".key").forEach(keyEl => {
  keyEl.addEventListener("click", () => {
    const k = keyEl.dataset.key || keyEl.textContent.trim();
    handleKey(k);
  });
});

// Physical keyboard support
document.addEventListener("keydown", e => {
  if (!wordleModal.classList.contains("hidden")) {
    if (e.key === "Enter") handleKey("ENTER");
    else if (e.key === "Backspace") handleKey("BACKSPACE");
    else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
  }
});

// ——— ANIMATION (SAFE) ———
function animateRow(rowIndex, guess) {
  const tiles = board.querySelectorAll(".tile");
  const start = rowIndex * 5;

  const count = {};
  for (const c of WORD) count[c] = (count[c] || 0) + 1;

  guess.split("").forEach((letter, i) => {
    setTimeout(() => {
      const tile = tiles[start + i];
      if (!tile) return;

      tile.textContent = letter;
      tile.classList.add("flip");

      if (letter === WORD[i]) {
        tile.classList.add("correct");
        count[letter]--;
      } else if (WORD.includes(letter) && count[letter] > 0) {
        tile.classList.add("present");
        count[letter]--;
      } else {
        tile.classList.add("absent");
      }

      // Update keyboard
      const key = document.querySelector(`.key[data-key="${letter}"]`);
      if (key) {
        if (letter === WORD[i]) key.classList.add("correct");
        else if (WORD.includes(letter) && !key.classList.contains("correct")) key.classList.add("present");
        else if (!key.classList.contains("correct") && !key.classList.contains("present")) key.classList.add("absent");
      }

      if (i === 4) {
        setTimeout(() => {
          if (guess === WORD) showMessage("Genius!", 5000);
          else if (guesses.length === 6) showMessage(`The word was ${WORD}`, 10000);
        }, 300);
      }
    }, i * 300);
  });
}

// ——— OPEN WORDLE ———
function openWordle() {
  mainGrid.classList.add("hidden");
  wordleModal.classList.remove("hidden");
  WORD = getWordOfTheDay();
  guesses = [];
  currentGuess = "";
  messageEl.classList.remove("show");
  document.querySelectorAll(".key").forEach(k => k.className = "key");
  initBoard();
  updateBoard();
}

// ——— BACK TO MAIN ———
function backToMain() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
  mainGrid.classList.remove("hidden");
}

// ——— DOTS NAVIGATION ———
// Add both click and touch events for mobile compatibility
document.querySelectorAll(".dot").forEach(dot => {
  const handleDotClick = () => {
    const id = parseInt(dot.dataset.id);
    if (id === 1) openChat();
    else if (id === 11) openWordle();
    else if (id === 13) openPokemon();
    else {
      alert(`Dot ${id} coming soon!`);
      backToMain();
    }
  };

  // Add both click and touchstart for maximum mobile compatibility
  dot.addEventListener("click", handleDotClick);
  dot.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent double events
    handleDotClick();
  }, { passive: false });
});

// ———————————————
// CHAT SYSTEM — RESTORED
// ———————————————
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

  loadChatUI();
}

function loadChatUI() {
  const chatList = document.getElementById("chat-list");
  const messages = document.getElementById("messages");
  const input = document.getElementById("chat-input");

  chatList.innerHTML = "";
  threadNames.forEach(thread => {
    const threadDiv = document.createElement("div");
    threadDiv.className = "thread";
    threadDiv.textContent = thread;
    threadDiv.onclick = () => openThread(thread);
    chatList.appendChild(threadDiv);
  });

  input.focus();
  input.onkeypress = (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      sendMessage(input.value.trim());
      input.value = "";
    }
  };
}

function openThread(name) {
  const messages = document.getElementById("messages");
  currentThread = name;
  messages.innerHTML = "";

  (threads[name] || []).forEach(msg => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${msg.from === "You" ? "user" : "other"}`;
    msgDiv.textContent = `${msg.from}: ${msg.text}`;
    messages.appendChild(msgDiv);
  });

  threadsData[name].unread = 0;
  saveChat();

  document.querySelectorAll(".thread").forEach(t => t.classList.remove("active"));
  event.target.classList.add("active");
}

function sendMessage(text) {
  if (!currentThread) {
    alert("Select a conversation first!");
    return;
  }

  const msg = { from: "You", text, time: Date.now() };
  threads[currentThread].push(msg);
  addMessageToUI(msg);

  setTimeout(() => {
    const response = { from: currentThread, text: getBotResponse(text), time: Date.now() };
    threads[currentThread].push(response);
    addMessageToUI(response);
    saveChat();
  }, 500);
}

function addMessageToUI(msg) {
  const messages = document.getElementById("messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${msg.from === "You" ? "user" : "other"}`;
  msgDiv.textContent = `${msg.from}: ${msg.text}`;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(input) {
  const responses = ["Got it!", "Interesting...", "Tell me more", "Thanks!", "Nice", "OK", "Cool!", "Yeah?", "Huh?", "Word"];
  return responses[Math.floor(Math.random() * responses.length)];
}

function saveChat() {
  localStorage.setItem("threads_names", JSON.stringify(threadNames));
  localStorage.setItem("threads", JSON.stringify(threads));
  localStorage.setItem("threads_data", JSON.stringify(threadsData));
}

function openChat() {
  mainGrid.classList.add("hidden");
  document.getElementById("chat-modal").classList.remove("hidden");
  loadChatUI();
}

// ———————————————
// POKEMON SYSTEM — RESTORED
// ———————————————
let pokemonNames = [];
let fullPokemonData = [];
let filteredList = [];
let currentPokemonName = "";
let currentPokemonSprite = "";

const GEN_RANGES = {
  "Gen 1": [1, 151],
  "Gen 2": [152, 251],
  "Gen 3": [252, 386],
  "Gen 4": [387, 493],
  "Gen 5": [494, 649],
  "Gen 6": [650, 721],
  "Gen 7": [722, 809],
  "Gen 8": [810, 898],
  "Gen 9": [899, 1025]
};

async function loadAllPokemonNames() {
  if (pokemonNames.length > 0) return;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
  const data = await res.json();

  pokemonNames = data.results.map(p => p.name);
  fullPokemonData = data.results;
}

function openPokemon() {
  document.getElementById("pokemon-modal").classList.remove("hidden");
  mainGrid.classList.add("hidden");

  loadAllPokemonNames().then(() => {
    document.querySelector('.gen-row button:first-child').classList.add('active');
    loadPokemon();
  });

  const input = document.getElementById("pokemon-guess");
  input.addEventListener("input", spellingAssist);
}

function setGeneration(gen) {
  document.querySelectorAll('.gen-row button').forEach(btn => btn.classList.remove('active'));

  if (gen === 'all') {
    filteredList = fullPokemonData;
    document.querySelector('.gen-row:nth-child(2) button:last-child').classList.add('active');
  } else {
    const start = GEN_RANGES[`Gen ${gen}`][0] - 1;
    const end = GEN_RANGES[`Gen ${gen}`][1];
    filteredList = fullPokemonData.slice(start, end);

    const row = gen <= 5 ? 1 : 2;
    const index = gen <= 5 ? gen - 1 : gen - 6;
    document.querySelector(`.gen-row:nth-child(${row}) button:nth-child(${index + 1})`).classList.add('active');
  }
  loadPokemon();
}

async function loadPokemon() {
  const pool = filteredList.length ? filteredList : fullPokemonData;

  const choice = pool[Math.floor(Math.random() * pool.length)];
  const res = await fetch(choice.url);
  const data = await res.json();

  currentPokemonName = data.name;
  currentPokemonSprite = data.sprites.front_default;

  const img = document.getElementById("pokemon-silhouette");
  img.src = currentPokemonSprite;
  img.style.filter = "brightness(0)";

  document.getElementById("pokemon-feedback").textContent = "";
  document.getElementById("pokemon-guess").value = "";
  document.getElementById("pokemon-suggestions").style.display = "none";
}

function guessPokemon() {
  const guess = document.getElementById("pokemon-guess").value.trim().toLowerCase();
  if (!guess) return;

  const feedback = document.getElementById("pokemon-feedback");

  if (guess === currentPokemonName) {
    feedback.textContent = "🎉 Correct!";
    document.getElementById("pokemon-silhouette").style.filter = "none";

    setTimeout(loadPokemon, 1500);
  } else {
    feedback.textContent = "❌ Wrong. Try again!";
  }
}

function giveHint() {
  const feedback = document.getElementById("pokemon-feedback");
  feedback.textContent = `Hint: Starts with \"${currentPokemonName[0].toUpperCase()}\"`;
}

// SPELLING ASSIST DROPDOWN
function spellingAssist() {
  const q = document.getElementById("pokemon-guess").value.toLowerCase();
  const list = document.getElementById("pokemon-suggestions");

  if (!q) { list.style.display = "none"; return; }

  const matches = pokemonNames
    .filter(n => n.startsWith(q))
    .slice(0, 12);

  list.innerHTML = "";
  matches.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    li.onclick = () => {
      document.getElementById("pokemon-guess").value = li.textContent;
      list.style.display = "none";
    };
    list.appendChild(li);
  });

  list.style.display = matches.length ? "block" : "none";
}

initChat();
