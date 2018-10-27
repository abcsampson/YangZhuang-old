const Constants = require('../Constants');

const Lee2018 = require('./Lee2018');
const Liao2010 = require('./Liao2010');

const Neutralize = {
    [Constants.OrthographyTitle.LIAO_2010]: Liao2010.neutralize,
    [Constants.OrthographyTitle.LEE_2018]: Lee2018.neutralize,
};

const Generate = {
    [Constants.OrthographyTitle.LIAO_2010]: Liao2010.generate,
    [Constants.OrthographyTitle.LEE_2018]: Lee2018.generate,
};

function convert(from = Constants.OrthographyTitle.LIAO_2010, to = Constants.OrthographyTitle.LIAO_2010, query) {
    const neutralize = Neutralize[from];
    const generate = Generate[to];

    if (!neutralize || !generate) {
        return query;
    }

    return generate(neutralize(query));
};


module.exports = {
    convert,
};
