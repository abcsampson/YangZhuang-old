define(['Lee2018', 'Liao2010', 'Constants', 'test'], function(Lee2018, Liao2010, Constants) {
    const { Dialect } = Constants;
    const Neutralizers = {
        'liao': Liao2010.neutralize,
        'lee': Lee2018.neutralize,
    };
    const Generators = {
        'lee': Lee2018.generate,
        'liao_2010_debao': Liao2010.createGenerator({ version: 1, dialect: Dialect.DEBAO }),
        'liao_2010_jingxi': Liao2010.createGenerator({ version: 1, dialect: Dialect.JINGXI }),
        'liao_2013': Liao2010.createGenerator({ version: 2 }),
        'liao_3': Liao2010.createGenerator({ version: 3 }),
    };

    function convert(from, to, value) {
        const neutralize = Neutralizers[from];
        const generate = Generators[to];

        return generate(neutralize(value));
    }

    function triggerConvert() {
        const fromScheme = document.getElementById("fromScheme").value;
        const toScheme = document.getElementById("toScheme").value;
        const text = document.getElementById("inputBox").value;

        document.getElementById("resultBox").value = convert(fromScheme, toScheme, text);
    }

    window.myAPI = {
        triggerConvert,
    }
});
