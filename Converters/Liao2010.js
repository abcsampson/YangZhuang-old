const Constants = require('../Constants');

const { Initial, Glide, Nucleus, Coda, Phonation, Tone } = Constants;

const SpecialPrefixes = ['IY', 'UV', 'IO', 'UE', 'UU'];
const GlottalGlideMarks = ['I', 'U'];

const InitialMarks = [
    'B', 'P', 'M', 'MB', 'F',
    'D', 'T', 'N', 'ND', 'L', 'S',
    'Z', 'C', 'SL', 'R',
    'Y',
    'G', 'K', 'NG',
    'V', 'H',
];

const GlideMarks = ['Y', 'V'];

// ueC, ioC
const SpecialNucleusMarks = ['AY', 'EY', 'OY', 'AO', 'AU', 'OA'];
const NormalNucleusMarks = ['A', 'AE', 'E', 'EO', 'I', 'EE', 'IO', 'O', 'OE', 'U', 'UE', 'UU', 'W'];

const CodaMarks = ['I', 'U', 'M', 'N', 'NG', 'P', 'T', 'K', 'B', 'D', 'G'];
const NonGlideCodaMarks = ['M', 'N', 'NG', 'P', 'T', 'K', 'B', 'D', 'G'];

const ToneMarks = ['Z', 'J', 'X', 'S', 'H', 'L', 'F', 'V', 'Q', 'R', 'C'];

function longestMatch(candidates, text) {
    return candidates.reduce((acc, current) => {
        if (text.startsWith(current) && current.length > acc.length) {
            return current;
        }

        return acc;
    }, '');
}

function tokenize(upperText) {
    let tail = upperText;
    let initialMark = '',
        glideMark = '',
        specialNucleusMark = '',
        normalNucleusMark = '';

    const specialPrefix = longestMatch(SpecialPrefixes, tail);
    const glottalGlideMark = longestMatch(GlottalGlideMarks, tail);

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
                const nonGlideCodaMark = longestMatch(NonGlideCodaMarks, tempTail);
                const toneMark = longestMatch(ToneMarks, tempTail);

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
                const nonGlideCodaMark = longestMatch(NonGlideCodaMarks, tempTail);

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
        const codaMark = longestMatch(CodaMarks, tempTail);
        const toneMark = longestMatch(ToneMarks, tempTail);

        if (!tempTail || codaMark || toneMark) {
            normalNucleusMark = glottalGlideMark;
        } else {
            glideMark = glottalGlideMark;
        }
    } else {
        initialMark = longestMatch(InitialMarks, tail);
        tail = tail.slice(initialMark.length);

        glideMark = longestMatch(GlideMarks, tail);
        tail = tail.slice(glideMark.length);
    }

    if (!normalNucleusMark) {
        specialNucleusMark = longestMatch(SpecialNucleusMarks, tail);
        tail = tail.slice(specialNucleusMark.length);

        if (!specialNucleusMark) {
            normalNucleusMark = longestMatch(NormalNucleusMarks, tail);
            tail = tail.slice(normalNucleusMark.length);
        }
    }

    const codaMark = longestMatch(CodaMarks, tail);
    tail = tail.slice(codaMark.length);

    const toneMark = longestMatch(ToneMarks, tail);
    tail = tail.slice(toneMark.length);

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
        original: upperText,
    };
}

const InitialToInitial = {
    '': Initial.Q,
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
        nucleus: Nucleus.O,
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
    'R': Tone.O,
    'C': Tone.O,
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
        const short = PtShortVowelMarks.includes(normalNucleusMark);
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
    const latinLetterRegex = /[a-zA-Z]+/g;
    const nonTargets = text.split(latinLetterRegex);
    const targets = text.match(latinLetterRegex).map((syllable) => neutralizeSyllable(syllable));

    let result = [];

    for (let i = 0; i < targets.length; i++) {
        result.push(nonTargets[i]);
        result.push(targets[i]);
    }

    result.push(nonTargets[nonTargets.length - 1]);

    return result;
}

module.exports = {
    neutralize,
    generate: (diu) => (diu),
};
