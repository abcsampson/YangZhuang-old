const Lee2018 = require('./Lee2018');
const Liao2010 = require('./Liao2010');

const Liao2010String = 'Meiz vaenz ouz, laemz rengz vax ta vaenz ious deemx duengh zeng yax gyaengs royz ak gvas. Slong gyaengs de ngams taen meiz pouj goenz ouz pyaij gvas maz, goenz deemx nir nuengh gungz slioj duengh ouz. Slong gyaengs de zoux yanh yax lac: poy roy hoyj goenz deemx tot gungz slioj duengh deemx ok gons, poy roy zoux ak gvas. Baenz beij nir, laemz rengz zoux bok meengh baus laemz ac. Poy roux naj, de vid baus, gyaengs goenz deemx zoux vid got gungz slioj duengh deemx kauj bay maens hem. Doek laeng, laemz rengz haet ngays gur mbur ndayj, ler zaih lac. Gem laeng, ta vaenz ngams ok maz au eij ndet de sleoj loengz maz eij zit ouz, goenz deemx ler tot gungz slioj duengh deemx ok nyaemz mbat dog lac. Beij nir, laemz rengz ler biz daos nyeenh sley lac.';

function testLiao2010(inputString, options) {
    const string = inputString.toLowerCase();
    const leeString = Lee2018.generate(Liao2010.neutralize(string));
    const convertedString = Liao2010.generate(Lee2018.neutralize(leeString), options);

    console.log(`Lee2018: ${leeString}`);

    if (convertedString !== string) {
        console.error('failed');

        const convertedWords = convertedString.match(/[A-Z]+/ig);
        const words = string.match(/[A-Z]+/ig);

        for (let i = 0; i < words.length; i++) {
            if (convertedWords[i] !== words[i]) {
                console.log(`mismatch: ${convertedWords[i]} ${words[i]}`);
            }
        }
    }
}

testLiao2010(Liao2010String, { version: 1 });

const debao = `
Slei-zeengz Deef-baov

Haet-slei: Lyaoq Hanq-bol
Haet-kyuf: Mav Eev-deef
Slan-kyuf: Zoul Yiov-hof
Cangq: Dangz-doih Mbaos-toj

Wmr...Her...Wmr…
Loengz zongz gin kauj nyaengz luemz tous
Zeengl-seenf gvei ious moyz lai-lai
Nin leh haet yaiz hoyj slaek gouh
Soenj kauj tauj rouh nin gvas daiz

Her, mayh moyz leux-zis, daeng daiz gus buh mbios,
eij haet-onj moyz, los laemz baiz-yaemh baet kuenj mioz, kuenj mioz
Mayh moyz leux-zis, daengz daiz gus buh mbios,
gau daih naek zeengz, haet-byous vangh-luemz moyz ndayj nir?
(Cangq moys)

Her, gyais buh doengz gyais (yoys leux-ngauz)
gyais buh doengz gyais (yoys leux-ngauz)
gyais buh doengz gyais (yoys leux-ngauz)

Wmr…
Loengz zongz gin kauj nyaengz luemz tous
Zeengl-seenf gvei ious moyz lai-lai
Nin leh haet yaiz hoyj slaek gouh
Soenj kauj tauj rouh … nin daemj tai
`;

testLiao2010(debao, { version: 1 });

testLiao2010('ue iyo ious', { version: 1 });
testLiao2010('lueg\' slao', { version: 1 });

function testLeeToLiao(inputString, options, expected) {
    const string = inputString.toLowerCase();
    const convertedString = Liao2010.generate(Lee2018.neutralize(string), options);

    console.log(`Liao2010: ${convertedString}`);

    if (convertedString !== expected) {
        console.error('failed');

        const convertedWords = convertedString.match(/[A-Z]+/ig);
        const words = expected.match(/[A-Z]+/ig);

        for (let i = 0; i < words.length; i++) {
            if (convertedWords[i] !== words[i]) {
                console.log(`mismatch: ${convertedWords[i]} ${words[i]}`);
            }
        }
    }
}

testLeeToLiao('sloa', { version: 1, dialect: 'DEBAO' }, 'sloa');
testLeeToLiao('sloa', { version: 1, dialect: 'JINGXI' }, 'sloa');
testLeeToLiao('sloa', { version: 2 }, 'slva');
testLeeToLiao('phoan', { version: 1, dialect: 'DEBAO' }, 'poen');
testLeeToLiao('phoan', { version: 1, dialect: 'JINGXI' }, 'paen');
testLeeToLiao('phoan', { version: 2 }, 'pvaen');
testLeeToLiao('luok', { version: 1 }, 'lueg\'');
testLeeToLiao('luok', { version: 2 }, 'luug');
