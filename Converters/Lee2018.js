const Constants = require('../Constants');
const Util = require('../Util');

const { Initial, Glide, Nucleus, Coda, Phonation, Tone, ToneCategory } = Constants;

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
    [Initial.S]: ['S', 'S'],
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

    if (initial === Initial.Q && (glide === Glide.J || glide === Glide.W)) {
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
    [Nucleus.Y]: 'UE',
    [Nucleus.OO]: 'OO',
    [Nucleus.O]: 'O',
    [Nucleus.UU]: 'UU',
    [Nucleus.U]: 'U',
    [Nucleus.EU]: 'EU',
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
            nucleusMark = 'UO';
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

function writeToneMark(toneless, tone) {
    if (tone === Tone.O) {
        return `${toneless}R`;
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

        return toneless.replace(/[AEIOU]/, (vowelMark) => VowelMarkToTonedVowelMark[vowelMark][toneMarkIndex]);
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

    return `${toneless.replace(/[AEIOU]/, (vowelMark) => VowelMarkToTonedVowelMark[vowelMark][toneMarkIndex])}H`;
}

function generateSingle(neutralized) {
    const {
        glide,
        tone,
    } = neutralized;

    const toneless = [
        getInitial(neutralized),
        GlideToMark[glide] || '',
        getRhyme(neutralized),
    ].join('');

    return writeToneMark(toneless, tone);
}

function generate(neutralizedObjects) {
    return neutralizedObjects.map((object) => {
        if (typeof object === 'string') {
            return object;
        }

        return generateSingle(object);
    }).join('').toLowerCase();
}

module.exports = {
    neutralize: (diu) => (diu),
    generate,
};
