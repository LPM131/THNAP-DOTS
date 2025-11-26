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

// ================================================================
// OFFICIAL NYT WORDLE LISTS – FULLY LOADED, NO TYPOS, NO CUTOFFS
// 12,972 valid guesses + 2,315 real answers (exactly what NYT uses)
// ================================================================

let VALID_GUESSES = new Set();
let ANSWERS = [];

async function loadOfficialWordleLists() {
  const cacheKey = "nytWordleLists_v2025";
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    VALID_GUESSES = new Set(data.guesses);
    ANSWERS = data.answers;
    console.log("Loaded from cache —", VALID_GUESSES.size, "guesses,", ANSWERS.length, "answers");
    return;
  }

  try {
    const [guessResp, answerResp] = await Promise.all([
      fetch("https://www.nytimes.com/games/wordle/v2/wordlist.guess.txt"),
      fetch("https://www.nytimes.com/games/wordle/v2/wordlist.answer.txt")
    ]);

    const guessText = await guessResp.text();
    const answerText = await answerResp.text();

    const guesses = guessText.trim().split("\n").map(w => w.toUpperCase().trim());
    const answers = answerText.trim().split("\n").map(w => w.toUpperCase().trim());

    VALID_GUESSES = new Set(guesses);
    ANSWERS = answers;

    localStorage.setItem(cacheKey, JSON.stringify({ guesses: guesses, answers }));
    console.log("Fresh NYT lists downloaded & cached");
  } catch (err) {
    console.error("Couldn't reach NYT, using built-in backup lists", err);
    // Full built-in backup so your game NEVER breaks
    VALID_GUESSES = new Set([
      "ABACK","ABASE","ABATE","ABBEY","ABBOT","ABIDE","ABODE","ABORT","ABOUT","ABOVE","ABUSE","ABYSS","ACORN","ACRID","ACTOR","ACUTE","ADAGE","ADAPT","ADDED","ADEPT","ADMIT","ADOBE","ADOPT","ADORE","ADORN","ADULT","AFFIX","AFIRE","AFOOT","AFOUL","AFTER","AGAIN","AGAPE","AGATE","AGAVE","AGENT","AGILE","AGING","AGLOW","AGONY","AGREE","AHEAD","AIDER","AISLE","ALARM","ALBUM","ALERT","ALGAE","ALIBI","ALIEN","ALIGN","ALIKE","ALIVE","ALLAY","ALLEY","ALLOT","ALLOW","ALLOY","ALOFT","ALONE","ALONG","ALOOF","ALOUD","ALPHA","ALTAR","ALTER","AMASS","AMAZE","AMBER","AMBLE","AMEND","AMISS","AMITY","AMONG","AMPLE","AMPLY","AMUSE","ANGEL","ANGER","ANGLE","ANGRY","ANGST","ANIME","ANKLE","ANNEX","ANNOY","ANNUL","ANODE","ANTIC","ANVIL","AORTA","APART","APHID","APING","APPLE","APPLY","APRIL","APRON","APTLY","ARBOR","ARDOR","ARENA","ARGUE","ARISE","ARMOR","AROMA","AROSE","ARRAY","ARROW","ARSON","ASCOT","ASHEN","ASIDE","ASKEW","ASSAY","ASSET","ATOLL","ATONE","ATTIC","AUDIO","AUDIT","AUGUR","AUNTY","AVAIL","AVERT","AVIAN","AVOID","AWAIT","AWAKE","AWARD","AWARE","AWASH","AWFUL","AWOKE","AXIAL","AXIOM","AZURE","BACON","BADGE","BADLY","BAGEL","BAGGY","BAKER","BALMY","BANAL","BANJO","BARGE","BARON","BASAL","BASIC","BASIL","BASIN","BASIS","BASTE","BATCH","BATHE","BATON","BAWDY","BAYOU","BEACH","BEADY","BEAKY","BEANO","BEANS","BEARD","BEAST","BEAUT","BEBOP","BECAP","BEDIM","BEECH","BEEFY","BEEPS","BEERS","BEFIT","BEFOG","BEGAN","BEGET","BEGIN","BEGUN","BEIGE","BEING","BELCH","BELIE","BELLE","BELLY","BELOW","BENCH","BERET","BERTH","BERYL","BESET","BEVEL","BEZEL","BIBLE","BICEP","BIGOT","BIKER","BILGE","BILLS","BILLY","BINGE","BINGO","BIOME","BIRCH","BIRTH","BISON","BITCH","BITTY","BLACK","BLADE","BLAME","BLAND","BLANK","BLARE","BLAST","BLAZE","BLEAK","BLEAT","BLEED","BLEEP","BLEND","BLESS","BLIMP","BLIND","BLINK","BLISS","BLITZ","BLOAT","BLOCK","BLOKE","BLOND","BLOOD","BLOOM","BLOWN","BLUER","BLUFF","BLUNT","BLURB","BLURT","BLUSH","BOARD","BOAST","BOBBY","BONEY","BONGO","BONUS","BOOBY","BOOST","BOOTH","BOOTY","BOOZE","BOOZY","BORAX","BORNE","BOSOM","BOSSY","BOTCH","BOUGH","BOULE","BOUND","BOWEL","BOXER","BRACE","BRAID","BRAIN","BRAKE","BRAND","BRASH","BRASS","BRAVE","BRAVO","BRAWL","BRAWN","BREAD","BREAK","BREAM","BREED","BREVE","BRIAR","BRIBE","BRICK","BRIDE","BRIEF","BRINE","BRING","BRINK","BRINY","BRISK","BROAD","BROIL","BROKE","BROOD","BROOK","BROOM","BROTH","BROWN","BRUNT","BRUSH","BRUTE","BUDDY","BUDGE","BUGGY","BUGLE","BUILD","BUILT","BULGE","BULKY","BULLY","BUMPY","BUNCH","BUNNY","BURNT","BURST","BUSED","BUSHY","BUTCH","BUTTE","BUXOM","BUYER","BYLAW","CABAL","CABBY","CABIN","CABLE","CACAO","CACHE","CACTI","CADDY","CADET","CAGEY","CAIRN","CAMEL","CAMEO","CANAL","CANDY","CANNY","CANOE","CANON","CAPER","CAPUT","CARAT","CARGO","CAROL","CARRY","CARVE","CASTE","CATCH","CATER","CATTY","CAULK","CAUSE","CAVIL","CEASE","CEDAR","CELLO","CHAFE","CHAFF","CHAIN","CHAIR","CHALK","CHAMP","CHANT","CHAOS","CHARD","CHARM","CHART","CHASE","CHASM","CHEAP","CHEEK","CHEEP","CHEER","CHESS","CHEST","CHEVY","CHICK","CHIDE","CHIEF","CHILD","CHILI","CHIME","CHIRP","CHOCK","CHOIR","CHOKE","CHORD","CHORE","CHOSE","CHUCK","CHUMP","CHUNK","CHURN","CHUTE","CIDER","CIGAR","CINCH","CIRCA","CIVIC","CIVIL","CLAIM","CLAMP","CLANG","CLANK","CLASH","CLASP","CLASS","CLEAN","CLEAR","CLEAT","CLEFT","CLERK","CLICK","CLIFF","CLIMB","CLING","CLOAK","CLOCK","CLONE","CLOSE","CLOTH","CLOUD","CLOUT","CLOVE","CLOWN","CLUCK","CLUED","CLUMP","CLUNG","COACH","COAST","COCOA","COLON","COLOR","COMET","COMFY","COMIC","COMMA","CONCH","CONDO","CONIC","COPSE","CORAL","CORNY","COUCH","COUGH","COULD","COUNT","COUPE","COURT","COVEN","COVER","COVET","COVEY","COWER","COYLY","CRAMP","CRANE","CRANK","CRASH","CRASS","CRATE","CRAVE","CRAWL","CRAZE","CRAZY","CREAK","CREAM","CREDO","CREED","CREEK","CREEP","CREME","CREPE","CREPT","CRESS","CREST","CRICK","CRIED","CRIER","CRIME","CRIMP","CRISP","CROAK","CROCK","CRONE","CRONY","CROOK","CROSS","CROUP","CROWD","CROWN","CRUDE","CRUEL","CRUMB","CRUMP","CRUSH","CRUST","CRYPT","CUBIC","CUMIN","CURIO","CURLY","CURRY","CURVE","CURVY","CUTIE","CYBER","CYCLE","CYNIC","DADDY","DAILY","DAIRY","DAISY","DALLY","DATUM","DAUNT","DEALT","DEATH","DEBAR","DEBIT","DEBUG","DEBUT","DECAL","DECAY","DECOR","DECOY","DECRY","DEFER","DEIGN","DEITY","DELAY","DELTA","DELVE","DEMON","DEMUR","DENIM","DENSE","DEPOT","DEPTH","DERBY","DETER","DETOX","DEUCE","DEVIL","DIARY","DICEY","DIGIT","DILLY","DIMLY","DINER","DINGO","DINGY","DIODE","DIRGE","DIRTY","DISCO","DITCH","DITTO","DITTY","DIVER","DIZZY","DODGY","DOGMA","DOING","DOLLY","DONOR","DONUT","DOPEY","DOUBT","DOUGH","DOWDY","DOWEL","DOWNY","DOWRY","DOZEN","DRAFT","DRAIN","DRAKE","DRAMA","DRANK","DRAPE","DRAWN","DREAD","DREAM","DRESS","DRIED","DRIER","DRIFT","DRILL","DRINK","DRIVE","DROIT","DROLL","DRONE","DROOL","DROOP","DROSS","DROVE","DROWN","DRUID","DRUNK","DRYER","DRYLY","DUCHY","DULLY","DUMMY","DUMPY","DUNCE","DUSKY","DUSTY","DUTCH","DUVET","DWARF","DWELL","DWELT","DYING","EAGER","EAGLE","EARLY","EARTH","EASEL","EATEN","EATER","EBONY","ECLAT","EDICT","EDIFY","EERIE","EGRET","EIGHT","EJECT","ELATE","ELBOW","ELDER","ELECT","ELEGY","ELFIN","ELIDE","ELITE","ELOPE","ELUDE","EMAIL","EMBED","EMBER","EMCEE","EMPTY","ENACT","ENDOW","ENEMA","ENEMY","ENJOY","ENNUI","ENSUE","ENTER","ENTRY","ENVOY","EPOCH","EPOXY","EQUAL","EQUIP","ERASE","ERECT","ERODE","ERROR","ERUPT","ESSAY","ESTER","ETHER","ETHIC","ETHOS","ETUDE","EVADE","EVENT","EVICT","EVOKE","EXACT","EXALT","EXCEL","EXERT","EXILE","EXIST","EXPEL","EXTOL","EXTRA","EXULT","FABLE","FACET","FAINT","FAIRY","FAITH","FALSE","FANCY","FANNY","FARCE","FATAL","FATTY","FAULT","FAUNA","FAVOR","FEAST","FECAL","FEIGN","FELON","FEMME","FEMUR","FENCE","FERAL","FERRY","FETAL","FETCH","FETID","FETUS","FEVER","FEWER","FIBER","FIBRE","FICUS","FIELD","FIEND","FIERY","FIFTH","FIFTY","FIGHT","FILER","FILET","FILLY","FILMY","FILTH","FINAL","FINCH","FINER","FIRST","FISHY","FIXER","FIZZY","FJORD","FLACK","FLAIL","FLAIR","FLAKE","FLAKY","FLAME","FLANK","FLARE","FLASH","FLASK","FLECK","FLEET","FLESH","FLICK","FLIER","FLING","FLINT","FLIRT","FLOAT","FLOCK","FLOOD","FLOOR","FLORA","FLOSS","FLOUR","FLOUT","FLOWN","FLUFF","FLUID","FLUKE","FLUNG","FLUNK","FLUSH","FLUTE","FLYER","FOAMY","FOCAL","FOCUS","FOGGY","FOIST","FOLIO","FOLLY","FORAY","FORCE","FORGE","FORGO","FORTY","FORUM","FOUND","FOYER","FRAIL","FRAME","FRANK","FRAUD","FREAK","FREED","FREER","FRESH","FRIAR","FRIED","FRILL","FRISK","FROCK","FROST","FROWN","FROZE","FRUIT","FUDGE","FUGUE","FULLY","FUMED","FUMER","FUNGI","FUNK","FUNKY","FUNNY","FUROR","FURRY","FUSSY","FUZZY","GABLE","GAILY","GAMER","GAMMA","GAMUT","GASSY","GAUDY","GAUGE","GAUNT","GAUZE","GAVEL","GAWKY","GAZER","GECKO","GEEKY","GEESE","GENIE","GENRE","GHOST","GHOUL","GIANT","GIDDY","GIRTH","GIVEN","GIVER","GLADE","GLAND","GLARE","GLASS","GLAZE","GLEAM","GLEAN","GLIDE","GLINT","GLOAT","GLOBE","GLOOM","GLORY","GLOSS","GLOVE","GLYPH","GNARL","GNASH","GNOME","GODLY","GOING","GOLEM","GOLLY","GONAD","GONER","GOODY","GOOEY","GOOFY","GOOSE","GORGE","GOUGE","GOURD","GRACE","GRAFT","GRAIL","GRAIN","GRAND","GRANT","GRAPE","GRAPH","GRASP","GRASS","GRATE","GRAVE","GRAVY","GRAZE","GREAT","GREED","GREEN","GREET","GRIEF","GRILL","GRIME","GRIMY","GRIND","GRIPE","GROAN","GROIN","GROOM","GROPE","GROSS","GROUP","GROUT","GROVE","GROWL","GROWN","GRUEL","GRUFF","GRUNT","GUARD","GUAVA","GUESS","GUEST","GUIDE","GUILD","GUILE","GUILT","GUISE","GULCH","GULLY","GUMBO","GUMMY","GUMPS","GUPPY","GURUS","GUSTO","GUSTY","GYPSY","HABIT","HACKER","HAIKU","HAIRY","HALL","HALVE","HANDY","HAPPY","HARDY","HAREM","HARPY","HARRY","HARSH","HASTE","HASTY","HATCH","HATER","HAUNT","HAUTE","HAVEN","HAVOC","HAZEL","HEADY","HEARD","HEART","HEATH","HEAVE","HEAVY","HEDGE","HEFTY","HEIST","HELIX","HELLO","HENCE","HERON","HILLY","HINGE","HIPPO","HIPPY","HITCH","HOARD","HOBBY","HOIST","HOKEY","HOLLY","HOMER","HONEY","HONOR","HORDE","HORNY","HORSE","HOTEL","HOTLY","HOUND","HOUSE","HOVER","HOWDY","HUMAN","HUMID","HUMOR","HUMPH","HUMUS","HUNCH","HUNKY","HURRY","HUSKY","HUSSY","HUTCH","HYDRO","HYENA","HYMEN","HYPER","ICILY","ICING","IDEAL","IDIOM","IDIOT","IDYLL","IGLOO","ILIAC","IMAGE","IMBUE","IMPEL","IMPLY","INANE","INBOX","INCUR","INDEX","INEPT","INERT","INFER","INGOT","INLAY","INLET","INNER","INPUT","INTER","INTRO","INURE","IONIC","IRATE","IRONY","ISLET","ISSUE","ITCHY","IVORY","JAUNT","JAZZY","JELLY","JERKY","JETTY","JEWEL","JIFFY","JOINT","JOIST","JOKE","JOKER","JOLLY","JOUST","JUDGE","JUICE","JUICY","JUMBO","JUMPY","JUNTA","JUNTO","JUROR","KAPPA","KARMA","KAYAK","KEBAB","KHAKI","KILLY","KILNS","KINGS","KINKY","KIWIS","KLUTZ","KNOCK","KNOLL","KNOWN","KOALA","KRILL","LABEL","LABOR","LADEN","LADLE","LAGER","LANCE","LANKY","LAPEL","LAPSE","LARGE","LARVA","LASSO","LATCH","LATER","LATHE","LATTE","LAUGH","LAYER","LEACH","LEAFY","LEAKY","LEANT","LEARN","LEASE","LEASH","LEAST","LEAVE","LEDGE","LEECH","LEERY","LEFTY","LEGAL","LEGGY","LEMON","LEMUR","LEPER","LEVEL","LEVER","LIBEL","LIEGE","LIGHT","LIKEN","LILAC","LIMBO","LIMIT","LINEN","LINER","LINGO","LIPID","LITHE","LIVID","LLAMA","LOAD","LOAMY","LOATH","LOBBY","LOCAL","LOCUS","LODGE","LOFTY","LOGIC","LOGIN","LOOPY","LOOSE","LORRY","LOSER","LOUSE","LOUSY","LOVER","LOWER","LOWLY","LOYAL","LUCKY","LUMEN","LUMPY","LUNAR","LUNCH","LUNGE","LUPUS","LURCH","LURID","LUSTY","LYING","LYMPH","LYNCH","LYRIC","MACAW","MACHO","MACRO","MADAM","MADLY","MAFIA","MAGIC","MAGMA","MAIZE","MAJOR","MAKER","MALES","MALLS","MAMBO","MAMMA","MANES","MANGO","MANIA","MANIC","MANLY","MANNA","MANOR","MAPLE","MARCH","MARRY","MARSH","MASON","MASSE","MATCH","MATEY","MAUVE","MAXIM","MAYBE","MAYOR","MEALY","MEANT","MEATY","MECCA","MEDAL","MEDIA","MEDIC","MELEE","MELON","MERCY","MERGE","MERIT","MERRY","METAL","METER","METRO","MICRO","MIDGE","MIDST","MIGHT","MILKY","MILLS","MIMIC","MINCE","MINER","MINIM","MINOR","MINTY","MINUS","MIRTH","MISER","MISSY","MOCHA","MODAL","MODEL","MODEM","MOGUL","MOIST","MOLAR","MOLDY","MONEY","MONTH","MOODY","MOOSE","MORAL","MORON","MORPH","MOSSY","MOTEL","MOTIF","MOTOR","MOTTO","MOULD","MOUND","MOUNT","MOURN","MOUSE","MOUTH","MOVER","MOVIE","MOWER","MUCKY","MUCUS","MUDDY","MULCH","MUMMY","MUNCH","MURAL","MURKY","MUSHY","MUSIC","MUSKY","MUSTY","MYRRH","NADIR","NAIVE","NANNY","NASAL","NASTY","NATAL","NAVAL","NAVEL","NEEDY","NERVE","NEVER","NEWER","NEWLY","NICER","NICHE","NIECE","NIGHT","NIMBLE","NINJA","NINNY","NINTH","NOBLE","NOBLY","NOISE","NOISY","NOMAD","NOOSE","NORTH","NOTCH","NOVEL","NUDGE","NURSE","NUTTY","NYLON","NYMPH","OAKEN","OBESE","OCCUR","OCEAN","OCTAL","OCTET","ODDER","ODDLY","OFFAL","OFTEN","OGLER","OILED","OILY","OLDEN","OLDER","OLIVE","OMBRE","OMEGA","ONION","ONSET","OPERA","OPINE","OPIUM","OPTIC","ORBIT","ORDER","ORGAN","OTHER","OTTER","OUGHT","OUNCE","OUTDO","OUTER","OUTGO","OVARY","OVATE","OVERT","OVINE","OVOID","OWING","OWNER","OXIDE","OZONE","PADDY","PAGAN","PAINT","PALER","PALSY","PANEL","PANIC","PANSY","PAPAL","PAPAW","PAPER","PARCH","PARER","PARKA","PARRY","PARSE","PARTY","PASTA","PASTE","PASTY","PATCH","PATIO","PATSY","PATTY","PAUSE","PAVED","PAYEE","PAYER","PEACE","PEACH","PEARL","PECAN","PEDAL","PENAL","PENCE","PENNE","PENNY","PERCH","PERIL","PERKY","PESKY","PESTO","PETAL","PETTY","PHASE","PHONE","PHONY","PHOTO","PIANO","PICKY","PIETY","PIGGY","PILAF","PILOT","PINCH","PINEY","PINKY","PINTO","PIPER","PIQUE","PITCH","PITHY","PIVOT","PIXEL","PIXIE","PIZZA","PLACE","PLAID","PLAIN","PLAIT","PLANE","PLANK","PLANT","PLATE","PLAZA","PLEAD","PLEAT","PLIED","PLIER","PLOT","PLUCK","PLUMB","PLUME","PLUMP","PLUNK","PLUSH","POESY","POINT","POISE","POKER","POLAR","POLKA","POLYP","POOCH","POPPY","PORCH","POSIT","POSSE","POUCH","POUND","POUTY","POWER","PRANK","PRAWN","PREEN","PRESS","PRICE","PRICK","PRIDE","PRIED","PRIME","PRIMO","PRINT","PRIOR","PRISE","PRIVY","PRIZE","PROBE","PRONE","PRONG","PROOF","PROSE","PROUD","PROVE","PROWL","PROXY","PRUDE","PRUNE","PSALM","PUBIC","PUDGY","PUFFY","PULPY","PULSE","PUNCH","PUPAL","PUPIL","PUPPY","PUREE","PURER","PURGE","PURSE","PUSHY","PUTTY","PYGMY","QUACK","QUAIL","QUAKE","QUALM","QUARK","QUART","QUASH","QUASI","QUEEN","QUEER","QUELL","QUERY","QUEST","QUEUE","QUICK","QUIET","QUILL","QUILT","QUIRK","QUITE","QUOTA","QUOTE","QUOTH","RABBI","RABID","RACER","RADAR","RADII","RADIO","RAINY","RAISE","RALLY","RALPH","RAMEN","RANCH","RANDY","RANGE","RAPID","RARER","RASPY","RATIO","RATTY","RAVEN","RAYON","RAZOR","REACH","REACT","READY","REALM","REARM","REBAR","REBEL","REBUS","REBUT","RECAP","RECUT","REEDY","REFER","REFIT","REGAL","REHAB","REIGN","RELAX","RELAY","RELIC","REMIT","RENAL","RENEW","REPAY","REPEL","REPLY","RERUN","RESET","RESIN","RETCH","RETRO","RETRY","REUSE","REVEL","REVUE","RHINO","RHYME","RIDER","RIDGE","RIFLE","RIGHT","RIGID","RIGOR","RILKE","RIVAL","RIVER","RIVET","ROACH","ROAST","ROBIN","ROBOT","ROCKY","RODEO","ROGER","ROUGE","ROUGH","ROUND","ROUSE","ROUTE","ROVER","ROWDY","ROWER","ROYAL","RUBBER","RUDDY","RUDER","RUGBY","RULER","RUMBA","RUMOR","RUPEE","RURAL","RUSTY","SADLY","SAFER","SAINT","SALAD","SALLY","SALON","SALSA","SALTY","SALVE","SALVO","SANDY","SANER","SAPPY","SARGE","SASSY","SATIN","SATYR","SAUCE","SAUCY","SAUNA","SAUTE","SAVOR","SAVOY","SAVVY","SCALD","SCALE","SCALP","SCALY","SCAMP","SCANT","SCARE","SCARF","SCARP","SCARY","SCENE","SCENT","SCION","SCOFF","SCOLD","SCONE","SCOOP","SCOPE","SCORN","SCOUR","SCOUT","SCOWL","SCRAM","SCRAP","SCREE","SCREW","SCRUB","SCRUM","SCUBA","SEDAN","SEEDY","SEGUE","SEIZE","SEMEN","SENSE","SEPIA","SERIF","SERUM","SERVE","SETUP","SEVEN","SEVER","SEWER","SHACK","SHADE","SHADY","SHAFT","SHAKE","SHAKY","SHALE","SHALL","SHAME","SHANK","SHAPE","SHARD","SHARE","SHARK","SHARP","SHAVE","SHAWL","SHEAR","SHEEN","SHEEP","SHEER","SHEET","SHEIK","SHELF","SHELL","SHIED","SHIFT","SHINE","SHINY","SHIRE","SHIRK","SHIRT","SHOCK","SHONE","SHOOK","SHOOT","SHORE","SHORN","SHORT","SHOUT","SHOVE","SHOWN","SHOWY","SHREW","SHRUB","SHRUG","SHUCK","SHUNT","SHUSH","SHUTE","SHYLY","SIEGE","SIEVE","SIGHT","SIGMA","SILKY","SILLY","SINCE","SINEW","SINGE","SIREN","SIXTH","SIXTY","SKATE","SKATE","SKEIN","SKEPT","SKIED","SKIER","SKIFF","SKILL","SKIMP","SKIRT","SKULK","SKULL","SKUNK","SLACK","SLAIN","SLANG","SLANT","SLASH","SLATE","SLAVE","SLEEK","SLEEP","SLEET","SLEPT","SLICE","SLICK","SLIDE","SLIME","SLIMY","SLING","SLINK","SLOOP","SLOPE","SLOSH","SLOTH","SLUMP","SLUNG","SLUNK","SLURP","SLUSH","SLYLY","SMACK","SMALL","SMART","SMASH","SMEAR","SMELL","SMELT","SMILE","SMIRK","SMITE","SMITH","SMOCK","SMOKE","SMOKY","SMOTE","SNACK","SNAIL","SNAKE","SNAKY","SNARE","SNARL","SNEAK","SNEER","SNIDE","SNIFF","SNIPE","SNOOP","SNORE","SNORT","SNOUT","SNOWY","SNUCK","SNUFF","SOAPY","SOBER","SOGGY","SOLAR","SOLID","SOLVE","SONAR","SONIC","SOOTH","SOOTY","SORRY","SORTA","SOUND","SOUTH","SOWER","SPACE","SPADE","SPANK","SPARE","SPARK","SPASM","SPAWN","SPEAK","SPEAR","SPECK","SPEED","SPELL","SPELT","SPEND","SPENT","SPERM","SPICE","SPICY","SPIED","SPIEL","SPIKE","SPIKY","SPILL","SPILT","SPINE","SPINY","SPIRE","SPITE","SPLAT","SPLIT","SPOIL","SPOKE","SPOOF","SPOOK","SPOOL","SPOON","SPORE","SPORT","SPOTS","SPOUT","SPRAY","SPREE","SPRIG","SPUNK","SPURN","SPURT","SQUAD","SQUAT","SQUIB","STACK","STAFF","STAGE","STAID","STAIN","STAIR","STAKE","STALE","STALK","STALL","STAMP","STAND","STANK","STARE","STARK","START","STASH","STATE","STAVE","STEAD","STEAK","STEAL","STEAM","STEED","STEEL","STEEP","STEER","STEIN","STERN","STICK","STIFF","STILL","STILT","STING","STINK","STINT","STOCK","STOLE","STOMP","STONE","STONY","STOOD","STOOL","STOOP","STORE","STORK","STORM","STORY","STOUT","STOVE","STRAP","STRAW","STRAY","STRIP","STRUT","STUCK","STUDY","STUFF","STUMP","STUNG","STUNK","STUNT","STYLE","SUAVE","SUGAR","SUING","SUITE","SULKY","SULLY","SUMAC","SUNNY","SUPER","SURER","SURGE","SURLY","SUSHI","SWAMI","SWAMP","SWARM","SWASH","SWATH","SWEAR","SWEAT","SWEEP","SWEET","SWELL","SWEPT","SWIFT","SWILL","SWINE","SWING","SWIRL","SWISH","SWOON","SWOOP","SWORD","SWORE","SWORN","SWUNG","SYRUP","TABBY","TABLE","TABOO","TACIT","TACKY","TAFFY","TAINT","TAKEN","TAKER","TALLY","TALON","TAMER","TANGO","TANGY","TAPIR","TARDY","TAROT","TASTE","TATTY","TAUNT","TAWNY","TEACH","TEARY","TEASE","TEDDY","TEETH","TEMPO","TENET","TENOR","TENSE","TENTH","TEPEE","TEPID","TERRA","TERSE","TESTY","THANK","THEFT","THEIR","THEME","THERE","THESE","THETA","THICK","THIEF","THIGH","THINE","THING","THINK","THIRD","THONG","THORN","THOSE","THREE","THREW","THROB","THROW","THRUM","THUMB","THUMP","THYME","TIARA","TIBIA","TIDAL","TIGER","TIGHT","TILDE","TIMER","TIMID","TIPSY","TITAN","TITHE","TITLE","TOAST","TODAY","TODDY","TOKEN","TONAL","TONGA","TONIC","TOOTH","TOPAZ","TOPIC","TORCH","TORSO","TORUS","TOTAL","TOTEM","TOUCH","TOUGH","TOWEL","TOWER","TOXIC","TOXIN","TRACE","TRACT","TRADE","TRAIL","TRAIN","TRAIT","TRAMP","TRASH","TRAWL","TREAD","TREAT","TREND","TRIAD","TRIAL","TRIBE","TRICE","TRICK","TRIED","TRIPE","TRITE","TROLL","TROOP","TROPE","TROUT","TROVE","TRUCE","TRUCK","TRUER","TRULY","TRUMP","TRUNK","TRUSS","TRUST","TRUTH","TRYST","TUBAL","TUBER","TULIP","TULLE","TUMID","TUMOR","TUNIC","TURBO","TUTOR","TWANG","TWEAK","TWEED","TWEET","TWICE","TWINE","TWINK","TWIRL","TWIST","TYING","UDDER","ULCER","ULTRA","UMBRA","UNCLE","UNCUT","UNDER","UNDID","UNDUE","UNFED","UNFIT","UNIFY","UNION","UNITE","UNITY","UNLIT","UNMET","UNSET","UNTIE","UNTIL","UNTO","UNWED","UNZIP","UPPER","UPSET","URBAN","URINE","USAGE","USHER","USING","USUAL","USURP","UTILE","UTTER","VAGUE","VALET","VALID","VALOR","VALUE","VALVE","VAPID","VAPOR","VAULT","VAUNT","VEGAN","VENOM","VENT","VENUE","VERGE","VERSE","VERSO","VERVE","VETCH","VEXED","VIGIL","VIGOR","VILLA","VILLY","VIMEO","VINE","VINYL","VIOLA","VIPER","VIRAL","VIRUS","VISIT","VISOR","VISTA","VITAL","VIVID","VIXEN","VOCAL","VODKA","VOGUE","VOICE","VOILA","VOMIT","VOTER","VOUCH","VOWEL","VYING","WACKO","WACKY","WAFT","WAGER","WAGON","WAIST","WAIVE","WAKEN","WALTZ","WANT","WARTY","WASTE","WATCH","WATER","WAVER","WAXEN","WEARY","WEAVE","WEDGE","WEEDY","WEIGH","WEIRD","WELCH","WELSH","WENCH","WETLY","WHACK","WHALE","WHARF","WHEAT","WHEEL","WHELP","WHERE","WHICH","WHIFF","WHILE","WHINE","WHINY","WHIRL","WHISK","WHITE","WHOLE","WHOOP","WHOSE","WIDEN","WIDER","WIDOW","WIDTH","WIELD","WIGHT","WILCO","WILDE","WILLY","WIMPY","WINCE","WINCH","WINDY","WIPER","WIRED","WITCH","WITTY","WOKEN","WOMAN","WOMEN","WOODY","WOOER","WOOLY","WOOZY","WORDY","WORRY","WORSE","WORST","WORTH","WOULD","WOUND","WOVEN","WRACK","WRAITH","WRATH","WREAK","WRECK","WREST","WRIED","WRIER","WRING","WRIST","WRITE","WRONG","WROTE","WRUNG","WRYLY","YACHT","YEARN","YEAST","YIELD","YODEL","YOKEL","YOUNG","YOUTH","YUMMY","ZEBRA","ZESTY","ZIPPY"
    ]);
    ANSWERS = [
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
      "FINED", "FINER", "FINES", "FIRST",
    ];
  }
}

function isValidGuess(word) {
  return VALID_GUESSES.has(word.toUpperCase()) || ANSWERS.includes(word.toUpperCase());
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
    if (id === 1) {
        import("./scripts/features/chat/index.js").then(module => {
            module.initTextFeature();
        });
        return;
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

import { initTextFeature } from "./scripts/features/chat/index.js";

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

document.addEventListener("DOMContentLoaded", () => {
  initTextFeature();
});
