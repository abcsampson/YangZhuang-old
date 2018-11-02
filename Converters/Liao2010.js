const Constants = require('../Constants');
const Util = require('../Util');

const { Initial, Glide, Nucleus, Coda, Dialect, Tone } = Constants;

const SpecialPrefixes = ['IY', 'UV', 'IO', 'UE', 'UU'];
const GlottalGlideMarks = ['I', 'U'];

const InitialMarks = [
    'B', 'P', 'M', 'MB', 'F',
    'D', 'T', 'N', 'ND', 'L', 'S',
    'Z', 'C', 'SL', 'R',
    'Y',
    'G', 'K', 'NG',
    'V', 'H', 'Q',
];

const GlideMarks = ['Y', 'V'];

// ueC, ioC
const SpecialNucleusMarks = ['AY', 'EY', 'OY', 'AO', 'AU', 'OA'];
const NormalNucleusMarks = ['A', 'AE', 'E', 'EO', 'I', 'EE', 'IO', 'O', 'OE', 'U', 'UE', 'UU', 'W'];

const CodaMarks = ['I', 'U', 'M', 'N', 'NG', 'P', 'T', 'K', 'B', 'D', 'G'];
const NonGlideCodaMarks = ['M', 'N', 'NG', 'P', 'T', 'K', 'B', 'D', 'G'];

const ToneMarks = ['Z', 'J', 'X', 'S', 'H', 'L', 'F', 'V', 'Q', 'R', 'C'];
const PTLongVowelMark = ['\''];

function tokenize(upperText) {
    let tail = upperText;
    let initialMark = '',
        glideMark = '',
        specialNucleusMark = '',
        normalNucleusMark = '';

    const specialPrefix = Util.longestMatch(SpecialPrefixes, tail);
    const glottalGlideMark = Util.longestMatch(GlottalGlideMarks, tail);

    if (specialPrefix) {
        switch (specialPrefix) {
            case 'IY':
                glideMark = 'IY';
                tail = tail.slice(2);
                break;
            case 'UV':
                glideMark = 'UV';
                tail = tail.slice(2);
                break;
            case 'IO': {
                const tempTail = tail.slice(2);
                const nonGlideCodaMark = Util.longestMatch(NonGlideCodaMarks, tempTail);
                const toneMark = Util.longestMatch(ToneMarks, tempTail);

                if (!tempTail || nonGlideCodaMark || toneMark) {
                    normalNucleusMark = 'IO';
                    tail = tempTail;
                } else {
                    glideMark = 'I';
                    tail = tail.slice(1);
                }
                break;
            }
            case 'UE':
            case 'UU': {
                const tempTail = tail.slice(2);
                const nonGlideCodaMark = Util.longestMatch(NonGlideCodaMarks, tempTail);

                if (nonGlideCodaMark) {
                    normalNucleusMark = specialPrefix;
                    tail = tempTail;
                } else {
                    glideMark = 'U';
                    tail = tail.slice(1);
                }
                break;
            }
        }
    } else if (glottalGlideMark) {
        initialMark = '';
        const tempTail = tail.slice(1);
        const codaMark = Util.longestMatch(CodaMarks, tempTail);
        const toneMark = Util.longestMatch(ToneMarks, tempTail);

        if (!tempTail || codaMark || toneMark) {
            normalNucleusMark = glottalGlideMark;
        } else {
            glideMark = glottalGlideMark;
        }
    } else {
        initialMark = Util.longestMatch(InitialMarks, tail);
        tail = tail.slice(initialMark.length);

        glideMark = Util.longestMatch(GlideMarks, tail);
        tail = tail.slice(glideMark.length);
    }

    if (!normalNucleusMark) {
        specialNucleusMark = Util.longestMatch(SpecialNucleusMarks, tail);
        tail = tail.slice(specialNucleusMark.length);

        if (!specialNucleusMark) {
            normalNucleusMark = Util.longestMatch(NormalNucleusMarks, tail);
            tail = tail.slice(normalNucleusMark.length);
        }
    }

    const codaMark = Util.longestMatch(CodaMarks, tail);
    tail = tail.slice(codaMark.length);

    const toneMark = Util.longestMatch(ToneMarks, tail);
    tail = tail.slice(toneMark.length);

    const ptLongVowelMark = Util.longestMatch(PTLongVowelMark, tail);
    tail = tail.slice(ptLongVowelMark.length);

    if (tail !== '') {
        return null;
    }

    return {
        initialMark,
        glideMark,
        specialNucleusMark,
        normalNucleusMark,
        codaMark,
        toneMark,
        ptLongVowelMark,
        original: upperText,
    };
}

const InitialToInitial = {
    '': Initial.Q,
    'Q': Initial.Q,
    'B': Initial.P,
    'P': Initial.P_A,
    'M': Initial.M,
    'MB': Initial.B,
    'F': Initial.F,
    'D': Initial.T,
    'T': Initial.T_A,
    'N': Initial.N,
    'ND': Initial.D,
    'L': Initial.L,
    'S': Initial.S,
    'Z': Initial.C,
    'C': Initial.C_A,
    'SL': Initial.SL,
    'R': Initial.R,
    'Y': Initial.J,
    'G': Initial.K,
    'K': Initial.K_A,
    'NG': Initial.NG,
    'V': Initial.W,
    'H': Initial.H,
};

const GlideToGlide = {
    'I': Glide.J,
    'Y': Glide.J,
    'IY': Glide.J,
    'U': Glide.W,
    'V': Glide.W,
    'UV': Glide.W,
};

const SpecialNucleusMap = {
    'AY': {
        nucleus: Nucleus.A,
        coda: Coda.J,
    },
    'EY': {
        nucleus: Nucleus.OE,
        coda: Coda.J,
    },
    'OY': {
        nucleus: Nucleus.O,
        coda: Coda.J,
    },
    'AO': {
        nucleus: Nucleus.AA,
        coda: Coda.W,
    },
    'AU': {
        nucleus: Nucleus.A,
        coda: Coda.W,
    },
    'OA': {
        nucleus: Nucleus.AA,
        coda: '',
    },
};

const NucleusToNucleus = {
    'A': Nucleus.AA,
    'AE': Nucleus.A,
    'E': Nucleus.EE,
    'EO': Nucleus.OE,
    'I': Nucleus.I,
    'EE': Nucleus.E,
    'IO': Nucleus.Y,
    'O': Nucleus.OO,
    'OE': Nucleus.O,
    'U': Nucleus.UU,
    'UE': Nucleus.U,
    'UU': Nucleus.U,
    'W': Nucleus.EU,
};

const CodaToCoda = {
    'I': Coda.J,
    'U': Coda.W,
    'M': Coda.M,
    'N': Coda.N,
    'NG': Coda.NG,
    'P': Coda.P,
    'T': Coda.T,
    'K': Coda.K,
    'B': Coda.P,
    'D': Coda.T,
    'G': Coda.K,
};

const ToneToTone = {
    '': Tone.A1,
    'Z': Tone.A2,
    'J': Tone.C1,
    'X': Tone.C2,
    'S': Tone.B1,
    'H': Tone.B2,
    'L': Tone.G1,
    'F': Tone.G2,
    'V': Tone.G3,
    'Q': Tone.G4,
    'R': Tone.R,
    'C': Tone.C,
};

const AllowGlideVInitialMarks = ['G', 'K', 'Q', 'H'];
const GuiliuToneMarks = ['L', 'F', 'V', 'Q'];
const ObstruentFinalMarks = ['P', 'T', 'K', 'B', 'D', 'G'];
const VoicelessObstruentFinalMarks = ['P', 'T', 'K'];
const PtShortVowelMarks = ['AE', 'EE', 'OE', 'UE'];

function isVowelAlternationV(tokens) {
    const {
        initialMark,
        glideMark,
        specialNucleusMark,
        normalNucleusMark,
        original,
    } = tokens;

    if (specialNucleusMark === 'OA') {
        return true;
    }

    if (original === 'KVAEN' || original === 'HVAEN') {
        return true;
    }

    if (glideMark !== 'V' || (!specialNucleusMark.startsWith('A') && !normalNucleusMark.startsWith('A'))) {
        return false;
    }

    return !AllowGlideVInitialMarks.includes(initialMark);
}

function analyze(tokens) {
    const {
        initialMark,
        glideMark,
        specialNucleusMark,
        normalNucleusMark,
        codaMark,
        toneMark,
        ptLongVowelMark,
    } = tokens;

    let initial,
        glide;

    const isGuiliu = GuiliuToneMarks.includes(toneMark);

    if (initialMark === 'N' && glideMark === 'Y' && !isGuiliu) {
        initial = Initial.NG;
        glide = Glide.J;
    } else if (isVowelAlternationV(tokens)) {
        glide = Glide.W_O;
    }

    let result = {
        initial: initial || InitialToInitial[initialMark],
        glide: glide || GlideToGlide[glideMark],
    };

    if (specialNucleusMark) {
        // No coda mark for special nuclei
        if (codaMark) {
            return null;
        }

        result = {
            ...result,
            ...SpecialNucleusMap[specialNucleusMark],
        };
    } else {
        let nucleus;

        if (isGuiliu && normalNucleusMark === 'O') {
            nucleus = Nucleus.O;
        }

        result = {
            ...result,
            nucleus: nucleus || NucleusToNucleus[normalNucleusMark],
            coda: CodaToCoda[codaMark],
        };
    }

    if (ObstruentFinalMarks.includes(codaMark)) {
        // No extra tone mark for obstruent finals
        if (toneMark) {
            return null;
        }

        const voiceless = VoicelessObstruentFinalMarks.includes(codaMark);
        const short = ptLongVowelMark ? false : PtShortVowelMarks.includes(normalNucleusMark);
        let tone;

        if (voiceless) {
            tone = (short ? Tone.DS1 : Tone.DL1);
        } else {
            tone = (short ? Tone.DS2 : Tone.DL2);
        }

        result = {
            ...result,
            tone,
        };
    } else {
        result = {
            ...result,
            tone: ToneToTone[toneMark],
        };
    }

    return result;
}

function neutralizeSyllable(syllable) {
    const tokens = tokenize(syllable.toUpperCase());

    if (!tokens) {
        return syllable;
    }

    const neutralized = analyze(tokens);

    if (!neutralized) {
        return syllable;
    }

    return neutralized;
}

function neutralize(text) {
    const allLetterRegex = /[A-Z']+/ig;
    const nonTargets = text.split(allLetterRegex);
    const targets = text.match(allLetterRegex).map((syllable) => neutralizeSyllable(syllable));

    let result = [];

    for (let i = 0; i < targets.length; i++) {
        result.push(nonTargets[i]);
        result.push(targets[i]);
    }

    result.push(nonTargets[nonTargets.length - 1]);

    return result;
}


const InitialToMark = {
    [Initial.P]: 'B',
    [Initial.P_A]: 'P',
    [Initial.B]: 'MB',
    [Initial.M]: 'M',
    [Initial.F]: 'F',
    [Initial.T]: 'D',
    [Initial.T_A]: 'T',
    [Initial.D]: 'ND',
    [Initial.N]: 'N',
    [Initial.L]: 'L',
    [Initial.C]: 'Z',
    [Initial.C_A]: 'C',
    [Initial.S]: 'S',
    [Initial.SL]: 'SL',
    [Initial.R]: 'R',
    [Initial.J]: 'Y',
    [Initial.K]: 'G',
    [Initial.K_A]: 'K',
    [Initial.NG]: 'NG',
    [Initial.W]: 'V',
    [Initial.Q]: '', // special handle QY, QW
    [Initial.H]: 'H',
};

const GlideToMark = {
    [Glide.J]: 'Y',
    [Glide.W]: 'V',
    [Glide.W_O]: 'V',
};

const ToneToMark = {
    [Tone.A1]: '',
    [Tone.A2]: 'Z',
    [Tone.B1]: 'S',
    [Tone.B2]: 'H',
    [Tone.C1]: 'J',
    [Tone.C2]: 'X',
    [Tone.DL1]: '',
    [Tone.DL2]: '',
    [Tone.DS1]: '',
    [Tone.DS2]: '',
    [Tone.G1]: 'L',
    [Tone.G2]: 'F',
    [Tone.G3]: 'V',
    [Tone.G4]: 'Q',
    [Tone.R]: 'R',
    [Tone.C]: 'C',
};

function getInitialAndGlide(neutralized, options) {
    const {
        initial,
        glide,
        nucleus,
        coda,
    } = neutralized;

    let initialMark = InitialToMark[initial];

    if (initial === Initial.NG && glide === Glide.J) {
        initialMark = 'N';
    }

    let glideMark = GlideToMark[glide] || '';

    if (initial === Initial.Q) {
        if (options.version === 3) {
            initialMark = 'Q';
        } else {
            const insertedY = (nucleus === Nucleus.OO && (
                coda !== Coda.J && coda !== Coda.W
            )) ? 'Y' : '';

            switch (glide) {
                case Glide.J:
                    glideMark = `I${insertedY}`;
                    break;
                case Glide.W:
                    glideMark = 'U';
                    break;
                default:
                    glideMark = '';
                    break;
            }
        }
    }

    if (glide === Glide.W_O && options.version === 1) {
        glideMark = '';
    }

    return `${initialMark}${glideMark}`;
}

const NucleusToMark = {
    [Nucleus.AA]: 'A',
    [Nucleus.A]: 'AE',
    [Nucleus.EE]: 'E',
    [Nucleus.OE]: 'EO',
    [Nucleus.I]: 'I',
    [Nucleus.E]: 'EE',
    [Nucleus.Y]: 'IO',
    [Nucleus.OO]: 'O',
    [Nucleus.O]: 'OE',
    [Nucleus.UU]: 'U',
    [Nucleus.U]: 'UE',
    [Nucleus.EU]: 'W',
};

const CodaToMark = {
    [Coda.J]: 'I',
    [Coda.W]: 'U',
    [Coda.M]: 'M',
    [Coda.N]: 'N',
    [Coda.NG]: 'NG',
    [Coda.P]: ['P', 'B'],
    [Coda.T]: ['T', 'D'],
    [Coda.K]: ['K', 'G'],
};

function getRhyme(neutralized, options) {
    const {
        glide,
        nucleus,
        coda,
        tone,
    } = neutralized;

    let surfaceNucleus = nucleus;

    if (glide === Glide.W_O && options.version === 1) {
        switch (options.dialect) {
            case Dialect.JINGXI:
                if (!coda) {
                    surfaceNucleus = Nucleus.O;
                }
                break;
            case Dialect.DEBAO:
            default:
                surfaceNucleus = Nucleus.O;
                break;
        }
    }

    let nucleusMark = NucleusToMark[surfaceNucleus];

    if (!coda) {
        if (surfaceNucleus === Nucleus.O) {
            return Util.isGuiliuTone(tone) ? 'O' : 'OA';
        }
    }

    if (coda === Coda.J) {
        switch (surfaceNucleus) {
            case Nucleus.A:
                return 'AY';
            case Nucleus.OE:
                return 'EY';
            case Nucleus.O:
                return 'OY';
        }
    }

    if (coda === Coda.W) {
        switch (surfaceNucleus) {
            case Nucleus.AA:
                return 'AO';
            case Nucleus.A:
                return 'AU';
        }
    }

    let codaMark = CodaToMark[coda] || '';

    if (coda === Coda.P || coda === Coda.T || coda === Coda.K) {
        codaMark = Util.isHighTone(tone) ? CodaToMark[coda][0] : CodaToMark[coda][1];

        if (surfaceNucleus === Nucleus.U && (tone === Tone.DL1 || tone === Tone.DL2)) {
            if (options.version >= 2) {
                nucleusMark = 'UU';
            } else {
                codaMark = `${codaMark}'`;
            }
        }
    }

    return `${nucleusMark}${codaMark}`;
}

function generateSingle(neutralized, options) {
    const {
        tone,
    } = neutralized;

    return [
        getInitialAndGlide(neutralized, options),
        getRhyme(neutralized, options),
        ToneToMark[tone],
    ].join('');
}

function generate(neutralizedObjects, options = { version: 3 }) {
    return neutralizedObjects.map((object) => {
        if (typeof object === 'string') {
            return object;
        }

        return generateSingle(object, options);
    }).join('').toLowerCase();
}

module.exports = {
    neutralize,
    generate,
};
