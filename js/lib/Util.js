define(['Constants'], function(Constants) {

    const { Initial, Phonation, ToneCategory } = Constants;

    function longestMatch(candidates, text) {
        return candidates.reduce((acc, current) => {
            if (text.startsWith(current) && current.length > acc.length) {
                return current;
            }

            return acc;
        }, '');
    }

    function getToneCategory(tone) {
        return tone[0];
    }

    const TaiToneCategories = [ToneCategory.A, ToneCategory.B, ToneCategory.C, ToneCategory.D];

    function isTaiTone(tone) {
        return TaiToneCategories.includes(tone[0]);
    }

    function isGuiliuTone(tone) {
        return tone[0] === ToneCategory.G;
    }

    function isHighTone(tone) {
        return isTaiTone(tone) && tone[tone.length - 1] === '1';
    }

    function isLowTone(tone) {
        return isTaiTone(tone) && tone[tone.length - 1] === '2';
    }

    const InitialToPhonations = {
        [Initial.P]: [Phonation['1U'], Phonation['2']],
        [Initial.P_A]: [Phonation['1A']],
        [Initial.B]: [Phonation['1G']],
        [Initial.M]: [Phonation['1U'], Phonation['2']],
        [Initial.F]: [Phonation['1U'], Phonation['2']],
        [Initial.T]: [Phonation['1U'], Phonation['2']],
        [Initial.T_A]: [Phonation['1A']],
        [Initial.D]: [Phonation['1G']],
        [Initial.N]: [Phonation['1U'], Phonation['2']],
        [Initial.L]: [Phonation['1U'], Phonation['2']],
        [Initial.C]: [Phonation['1U'], Phonation['2']],
        [Initial.C_A]: [Phonation['1A']],
        [Initial.S]: [Phonation['1A']],
        [Initial.SL]: [Phonation['1U'], Phonation['2']],
        [Initial.R]: [Phonation['1U'], Phonation['2']],
        [Initial.J]: [Phonation['1U'], Phonation['2']],
        [Initial.K]: [Phonation['1U'], Phonation['2']],
        [Initial.K_A]: [Phonation['1A']],
        [Initial.NG]: [Phonation['1U'], Phonation['2']],
        [Initial.W]: [Phonation['1U'], Phonation['2']],
        [Initial.Q]: [Phonation['1G']],
        [Initial.H]: [Phonation['1A']],
    };

    function getPhonations(initial) {
        return InitialToPhonations[initial];
    }

    function isHighPhonation(phonation) {
        return phonation[0] === '1';
    }

    function isLowPhonation(phonation) {
        return phonation[0] === '2';
    }

    return {
        longestMatch,
        getToneCategory,
        isTaiTone,
        isGuiliuTone,
        isHighTone,
        isLowTone,
        getPhonations,
        isHighPhonation,
        isLowPhonation,
    };

});
