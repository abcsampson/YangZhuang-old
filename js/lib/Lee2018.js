define(['Constants', 'Util'], function(Constants, Util) {

    const { Initial, Glide, Nucleus, Coda, Tone, ToneCategory, Format } = Constants;

    const InitialMarks = [
        'B', 'P', 'PH', 'M', 'MH', 'MB', 'F', 'V',
        'D', 'T', 'TH', 'N', 'NH', 'ND', 'L', 'LH', 'S', 'Z',
        'J', 'C', 'CH', 'SL', 'ZL', 'R', 'RH',
        'Y', 'YH',
        'G', 'K', 'KH', 'NG', 'NGH',
        'W', 'WH', 'H', 'Q',
    ];

    const GlideMarks = ['Y', 'W', 'OA'];

    const NucleusMarks = ['AA', 'A', 'EE', 'E', 'IE', 'UI', 'I', 'OO', 'O', 'OE', 'UU', 'U', 'OU', 'OI'];

    const CodaMarks = ['Y', 'W', 'M', 'N', 'NG', 'P', 'T', 'K'];

    const VowelToneMarks = ['', '`', '\'', '^'];
    const WordToneMarks = ['R', 'C', 'H'];

    const allVowelLetters = 'AÀÁÂEÈÉÊIÌÍÎOÒÓÔUÙÚÛ';
    const graveAccent = String.fromCharCode(0x300);
    const acuteAccent = String.fromCharCode(0x301);
    const circumflex = String.fromCharCode(0x302);
    const allDiacritics = [graveAccent, acuteAccent, circumflex].join('');

    function separateToneMark(upperText) {
        let vowelToneMark = '',
            tail = '';

        for (let i = 0; i < upperText.length; i++) {
            const index = allVowelLetters.indexOf(upperText[i]);
            const diacriticIndex = allDiacritics.indexOf(upperText[i]);

            if (index > -1) {
                const toneMarkIndex = index % 4;

                vowelToneMark = vowelToneMark || VowelToneMarks[toneMarkIndex];
                tail += allVowelLetters[index - toneMarkIndex];
            } else if (diacriticIndex > -1) {
                vowelToneMark = vowelToneMark || VowelToneMarks[diacriticIndex + 1];
            } else {
                tail += upperText[i];
            }
        }

        return {
            tail,
            vowelToneMark,
        };
    }

    function tokenize(upperText) {
        let {
            tail,
            vowelToneMark,
        } = separateToneMark(upperText);

        const initialMark = Util.longestMatch(InitialMarks, tail);
        tail = tail.slice(initialMark.length);

        let glideMark = Util.longestMatch(GlideMarks, tail);
        if (glideMark === 'OA') {
            glideMark = 'O';
        }
        tail = tail.slice(glideMark.length);

        const nucleusMark = Util.longestMatch(NucleusMarks, tail);
        tail = tail.slice(nucleusMark.length);

        const codaMark = Util.longestMatch(CodaMarks, tail);
        tail = tail.slice(codaMark.length);

        const wordToneMark = Util.longestMatch(WordToneMarks, tail);
        tail = tail.slice(wordToneMark.length);

        if (tail !== '') {
            return null;
        }

        return {
            initialMark,
            glideMark,
            nucleusMark,
            codaMark,
            vowelToneMark,
            wordToneMark,
            original: upperText,
        };
    }

    const InitialToInitial = {
        '': Initial.Q,
        'Q': Initial.Q,
        'B': Initial.P,
        'P': Initial.P,
        'PH': Initial.P_A,
        'M': Initial.M,
        'MH': Initial.M,
        'MB': Initial.B,
        'F': Initial.F,
        'V': Initial.F,
        'D': Initial.T,
        'T': Initial.T,
        'TH': Initial.T_A,
        'N': Initial.N,
        'NH': Initial.N,
        'ND': Initial.D,
        'L': Initial.L,
        'LH': Initial.L,
        'S': Initial.S,
        'Z': Initial.S,
        'J': Initial.C,
        'C': Initial.C,
        'CH': Initial.C_A,
        'SL': Initial.SL,
        'ZL': Initial.SL,
        'R': Initial.R,
        'RH': Initial.R,
        'Y': Initial.J,
        'YH': Initial.J,
        'G': Initial.K,
        'K': Initial.K,
        'KH': Initial.K_A,
        'NG': Initial.NG,
        'NGH': Initial.NG,
        'W': Initial.W,
        'WH': Initial.W,
        'H': Initial.H,
    };

    const VoicedInitialMarks = ['B', 'M', 'V', 'D', 'N', 'L', 'Z', 'ZL', 'J', 'R', 'Y', 'G', 'NG', 'W'];
    const ObstruentFinalMarks = ['P', 'T', 'K'];
    const PtShortVowelMarks = ['A', 'E', 'O', 'U'];

    const GlideToGlide = {
        'Y': Glide.J,
        'W': Glide.W,
        'O': Glide.W_O,
    };

    const NucleusToNucleus = {
        'AA': Nucleus.AA,
        'A': Nucleus.A,
        'EE': Nucleus.EE,
        'OE': Nucleus.OE,
        'I': Nucleus.I,
        'E': Nucleus.E,
        'IE': Nucleus.E,
        'OI': Nucleus.Y,
        'OO': Nucleus.OO,
        'O': Nucleus.O,
        'UU': Nucleus.UU,
        'U': Nucleus.U,
        'OU': Nucleus.U,
        'UI': Nucleus.EU,
    };

    const CodaToCoda = {
        'Y': Coda.J,
        'W': Coda.W,
        'M': Coda.M,
        'N': Coda.N,
        'NG': Coda.NG,
        'P': Coda.P,
        'T': Coda.T,
        'K': Coda.K,
    };

    const GuiliuToneToTone = {
        '': Tone.G1,
        '`': Tone.G3,
        '\'': Tone.G4,
        '^': Tone.G2,
    };

    const HighToneToTone = {
        '': Tone.A1,
        '`': Tone.B1,
        '\'': Tone.C1,
        '^': Tone.A2,
    };

    const LowToneToTone = {
        '': Tone.A2,
        '`': Tone.B2,
        '\'': Tone.C2,
        '^': Tone.A2,
    };

    function analyze(tokens) {
        const {
            initialMark,
            glideMark,
            nucleusMark,
            codaMark,
            vowelToneMark,
            wordToneMark,
            original,
        } = tokens;

        const isGuiliu = wordToneMark === 'H';

        const initial = InitialToInitial[initialMark];
        const glide = GlideToGlide[glideMark];
        let nucleus = NucleusToNucleus[nucleusMark];
        const coda = CodaToCoda[codaMark];

        if (!codaMark) {
            if (nucleusMark === 'A') {
                nucleus = Nucleus.AA;
            } else if (nucleusMark === 'U') {
                nucleus = Nucleus.UU;
            } else if (nucleusMark === 'O' && !isGuiliu) {
                nucleus = Nucleus.OO;
            }
        } else if (codaMark === 'Y') {
            if (nucleusMark === 'E') {
                nucleus = Nucleus.EE;
            } else if (nucleusMark === 'U') {
                nucleus = Nucleus.UU;
            }
        } else if (codaMark === 'W') {
            if (nucleusMark === 'E') {
                nucleus = Nucleus.EE;
            } else if (nucleusMark === 'O') {
                nucleus = Nucleus.OO;
            }
        }

        let tone;
        const isDTone = ObstruentFinalMarks.includes(codaMark);
        const isPtShortVowel = PtShortVowelMarks.includes(nucleusMark);

        if (isGuiliu) {
            tone = GuiliuToneToTone[vowelToneMark];
        } else if (wordToneMark === 'R') {
            tone = Tone.R;
        } else if (wordToneMark === 'C') {
            tone = Tone.C;
        } else if (VoicedInitialMarks.includes(initialMark)){
            if (isDTone) {
                tone = isPtShortVowel ? Tone.DS2 : Tone.DL2;
            } else {
                tone = LowToneToTone[vowelToneMark];
            }
        } else {
            if (isDTone) {
                tone = isPtShortVowel ? Tone.DS1 : Tone.DL1;
            } else {
                tone = HighToneToTone[vowelToneMark];
            }
        }

        return {
            initial,
            glide,
            nucleus,
            coda,
            tone,
        };
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

        let format = Format.ALL_SMALL;
        const visualLength = syllable.replace(new RegExp(`[${allDiacritics}]`, 'g'), (diacritic) => '').length;
        if (visualLength > 1 && syllable.toUpperCase() === syllable) {
            format = Format.ALL_CAPITAL;
        } else if (syllable[0].toUpperCase() === syllable[0]) {
            format = Format.CAPITAL_INITIAL
        }

        return {
            ...neutralized,
            format,
        };
    }

    function neutralize(text) {
        const allLetterRegex = new RegExp(`[A-Z${allVowelLetters}${allDiacritics}]+`, 'ig');
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

    // [high mark, low mark]
    const InitialToMark = {
        [Initial.P]: ['P', 'B'],
        [Initial.P_A]: ['PH', 'PH'],
        [Initial.B]: ['MB', 'MB'],
        [Initial.M]: ['MH', 'M'],
        [Initial.F]: ['F', 'V'],
        [Initial.T]: ['T', 'D'],
        [Initial.T_A]: ['TH', 'TH'],
        [Initial.D]: ['ND', 'ND'],
        [Initial.N]: ['NH', 'N'],
        [Initial.L]: ['LH', 'L'],
        [Initial.C]: ['C', 'J'],
        [Initial.C_A]: ['CH', 'CH'],
        [Initial.S]: ['S', 'Z'],
        [Initial.SL]: ['SL', 'ZL'],
        [Initial.R]: ['RH', 'R'],
        [Initial.J]: ['YH', 'Y'],
        [Initial.K]: ['K', 'G'],
        [Initial.K_A]: ['KH', 'KH'],
        [Initial.NG]: ['NGH', 'NG'],
        [Initial.W]: ['WH', 'W'],
        [Initial.Q]: ['', ''], // special handle QY, QW
        [Initial.H]: ['H', 'H'],
    };

    function getInitial(neutralized) {
        const {
            initial,
            glide,
            tone,
        } = neutralized;

        if (initial === Initial.Q && glide) {
            return 'Q';
        }

        const candidates = InitialToMark[initial];

        if (!Util.isTaiTone(tone)) {
            // If the two candidates have different length, use the shorter one
            // Else use the high consonant
            if (candidates[0].length <= candidates[1].length) {
                return candidates[0];
            }

            return candidates[1];
        }

        const allPhonations = Util.getPhonations(initial);

        // Only 1 phonation, return the only mark
        if (allPhonations.length === 1) {
            return candidates[0];
        }

        return Util.isHighTone(tone) ? candidates[0] : candidates[1];
    }

    const GlideToMark = {
        [Glide.J]: 'Y',
        [Glide.W]: 'W',
        [Glide.W_O]: 'O',
    };

    const NucleusToMark = {
        [Nucleus.AA]: 'AA',
        [Nucleus.A]: 'A',
        [Nucleus.EE]: 'EE',
        [Nucleus.OE]: 'OE',
        [Nucleus.I]: 'I',
        [Nucleus.E]: 'E',
        [Nucleus.Y]: 'OI',
        [Nucleus.OO]: 'OO',
        [Nucleus.O]: 'O',
        [Nucleus.UU]: 'UU',
        [Nucleus.U]: 'U',
        [Nucleus.EU]: 'UI',
    };

    const CodaToMark = {
        [Coda.J]: 'Y',
        [Coda.W]: 'W',
        [Coda.M]: 'M',
        [Coda.N]: 'N',
        [Coda.NG]: 'NG',
        [Coda.P]: 'P',
        [Coda.T]: 'T',
        [Coda.K]: 'K',
    };

    function getRhyme(neutralized) {
        const {
            nucleus,
            coda,
            tone,
        } = neutralized;

        let nucleusMark = NucleusToMark[nucleus];

        if (!coda) {
            if (nucleus === Nucleus.O && Util.isGuiliuTone(tone)) {
                return 'O';
            }

            if (nucleus === Nucleus.OO || nucleus === Nucleus.UU || nucleus === Nucleus.AA) {
                return nucleusMark[0];
            }
        }

        if (coda === Coda.J) {
            if (nucleus === Nucleus.UU || nucleus === Nucleus.EE) {
                nucleusMark = nucleusMark[0];
            }
        } else if (coda === Coda.W) {
            if (nucleus === Nucleus.OO || nucleus === Nucleus.EE) {
                nucleusMark = nucleusMark[0];
            }
        } else if (coda === Coda.P || coda === Coda.T || coda === Coda.K) {
            if (nucleus === Nucleus.U && (tone === Tone.DL1 || tone === Tone.DL2)) {
                nucleusMark = 'OU';
            }
            if (nucleus === Nucleus.E && (tone === Tone.DL1 || tone === Tone.DL2)) {
                nucleusMark = 'IE';
            }
        }

        return `${nucleusMark}${CodaToMark[coda] || ''}`;
    }

    const VowelMarkToTonedVowelMark = {
        'A': 'AÀÁÂ',
        'E': 'EÈÉÊ',
        'I': 'IÌÍÎ',
        'O': 'OÒÓÔ',
        'U': 'UÙÚÛ',
    };

    function writeToneMarkOnVowel(toneless, toneMarkIndex) {
        return toneless.replace(/[AEIOU]+/, (vowelSequence) => {
            if (vowelSequence.length === 2 && vowelSequence[0] !== vowelSequence[1]) {
                return `${vowelSequence[0]}${VowelMarkToTonedVowelMark[vowelSequence[1]][toneMarkIndex]}`;
            }

            return `${VowelMarkToTonedVowelMark[vowelSequence[0]][toneMarkIndex]}${vowelSequence.slice(1)}`;
        });
    }

    function writeToneMark(toneless, tone) {
        if (tone === Tone.R) {
            return `${toneless}R`;
        }

        if (tone === Tone.C) {
            return `${toneless}C`;
        }

        if (Util.isTaiTone(tone)) {
            let toneMarkIndex;
            const toneCategory = Util.getToneCategory(tone);

            switch (toneCategory) {
                case ToneCategory.A:
                case ToneCategory.D:
                    toneMarkIndex = 0;
                    break;
                case ToneCategory.B:
                    toneMarkIndex = 1;
                    break;
                case ToneCategory.C:
                    toneMarkIndex = 2;
                    break;
            }

            return writeToneMarkOnVowel(toneless, toneMarkIndex);
        }

        let toneMarkIndex;
        switch (tone) {
            case Tone.G1:
                toneMarkIndex = 0;
                break;
            case Tone.G3:
                toneMarkIndex = 1;
                break;
            case Tone.G4:
                toneMarkIndex = 2;
                break;
            case Tone.G2:
                toneMarkIndex = 3;
                break;
        }

        return `${writeToneMarkOnVowel(toneless, toneMarkIndex)}H`;
    }

    function generateSingle(neutralized) {
        const {
            glide,
            tone,
            format,
        } = neutralized;

        const toneless = [
            getInitial(neutralized),
            GlideToMark[glide] || '',
            getRhyme(neutralized),
        ].join('');

        const string = writeToneMark(toneless, tone);

        switch (format) {
            case Format.ALL_CAPITAL:
                return string.toUpperCase();
            case Format.CAPITAL_INITIAL:
                return string[0].toUpperCase() + string.slice(1).toLowerCase();
            case Format.ALL_SMALL:
            default:
                return string.toLowerCase();
        }
    }

    function generate(neutralizedObjects) {
        return neutralizedObjects.map((object) => {
            if (typeof object === 'string') {
                return object;
            }

            return generateSingle(object);
        }).join('');
    }

    return {
        neutralize,
        generate,
    };
});
