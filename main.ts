interface Karte {
    title: string,
    text: string,
    benutzt: boolean
}
type Karten = Karte[];

let karten: Karten | undefined;
const STORAGE_KARTEN = 'karten'
function ladeKarten() {
    const str = localStorage.getItem(STORAGE_KARTEN);
    if (str === null || str === undefined || str === 'undefined') {
        karten = [];
    }
    else {
        karten = JSON.parse(str) as Karten;
    }
}
function saveKarten() {
    localStorage.setItem(STORAGE_KARTEN, JSON.stringify(karten));
}

function setKarten(k: Karten) {
    karten = k;
    saveKarten();
}

function getKarten(): Karten {
    if (karten === undefined) {
        ladeKarten();
    }
    return karten ?? [];
}

type SelectorOption = {
    value: string,
    text: string
}

const wrapperDiv = document.createElement('div');
wrapperDiv.classList.add('wrapper');
document.body.appendChild(wrapperDiv);

maleKartenSeite();


function maleKartenSeite() {
    wrapperDiv.innerHTML = '';

    // draw header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');
    wrapperDiv.appendChild(headerDiv);

    // draw selector
    const selector = document.createElement('select');
    headerDiv.appendChild(selector);
    const selectorValues: SelectorOption[] = [{
        value: 'unbenutzt',
        text: 'Unbenutzte Karten'
    }, {
        value: 'benutzt',
        text: 'Benutzte Karten'
    }, {
        value: 'alle',
        text: 'Alle Karten'
    }]
    for (let selectorVal of selectorValues) {
        const option = new Option(selectorVal.text, selectorVal.value);
        selector.appendChild(option);
    }
    selector.onchange = () => {
        maleKartenInContentDiv(contentDiv, selector);
    };

    // draw button
    const button = document.createElement('button');
    button.classList.add('floatRight');
    headerDiv.appendChild(button);
    button.innerHTML = 'Bearbeiten'
    button.onclick = () => maleNeueSeite()

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    wrapperDiv.appendChild(contentDiv);

    maleKartenInContentDiv(contentDiv, selector);
}

function maleKartenInContentDiv(contentDiv: HTMLDivElement, selector: HTMLSelectElement) { 

    const value = selector.value;
    let karten: Karten;
    if (value === 'unbenutzt') {
        karten = getKarten().filter(k => !k.benutzt);
    }
    else if (value === 'benutzt') {
        karten = getKarten().filter(k => k.benutzt);
    }
    else {
        karten = getKarten();
    }

    contentDiv.innerHTML = '';
    if (karten.length === 0) {
        const text = document.createElement('div');
        contentDiv.appendChild(text);
        text.classList.add('centerText')
        text.innerHTML = 'Hier gibt\'s nichts zu sehen!';
    }
    else {
        const centerWrapperDiv = document.createElement('div');
        contentDiv.appendChild(centerWrapperDiv);
        centerWrapperDiv.classList.add('centerContent');
    
        const centerDiv = document.createElement('div');
        centerDiv.classList.add('centerContentInnerDiv')
        centerWrapperDiv.appendChild(centerDiv);

        for (let karte of karten) {
            const kDiv = document.createElement('div');
            kDiv.classList.add('karte');
            centerDiv.appendChild(kDiv);
            setClassForKarte(kDiv, karte)
            kDiv.ondblclick = () => {
                karte.benutzt = !karte.benutzt;
                saveKarten();
                maleKartenInContentDiv(contentDiv, selector);
            }
    
            const title = document.createElement('h2');
            title.classList.add('title')
            title.textContent = karte.title;
            kDiv.appendChild(title);
    
            const text = document.createElement('p');
            text.classList.add('text');
            text.textContent = karte.text;
            kDiv.appendChild(text);
        }
    }
}

function maleNeueSeite() {
    let ks = copyKarten(getKarten());

    wrapperDiv.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header')
    wrapperDiv.appendChild(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('newPageContent');
    wrapperDiv.appendChild(contentDiv);

    const footerDiv = document.createElement('div');
    footerDiv.classList.add('footer');
    wrapperDiv.appendChild(footerDiv);

    const saveButton = document.createElement('button');
    saveButton.classList.add('floatRight');
    saveButton.innerHTML = 'Speichern';
    saveButton.onclick = () => {
        setKarten(ks);
        maleKartenSeite();
    }
    footerDiv.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('floatRight', 'lightButton');
    cancelButton.innerHTML = 'Abbrechen';
    cancelButton.onclick = () => {
        maleKartenSeite();
    }
    footerDiv.appendChild(cancelButton);

    const loadButton = document.createElement('button');
    loadButton.classList.add('inpButton', 'floatRight');
    loadButton.textContent = 'Aus Datei laden';
    headerDiv.appendChild(loadButton);
    const inp = document.createElement('input');
    loadButton.appendChild(inp);
    inp.setAttribute('id', 'inp');
    inp.accept = '.json';
    inp.type = 'file';
    inp.onchange = () => {
        if (inp.files) {
            const file = inp.files?.item(0);
            file?.text().then(t => {
                try {
                    ks = JSON.parse(t) as Karten;
                    maleNeueKartenInContentDiv(contentDiv, ks);
                } catch (e) {
                    console.error(e);
                }
            })
        }
    }

    const exp = (karten: Karten) => {
        const content = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(karten));
        const a = document.createElement('a');
        a.href = content;
        a.download = 'karten.json';
        a.click();
    }

    const exportNoUsedButton = document.createElement('button');
    exportNoUsedButton.classList.add('floatRight', 'lightButton');
    exportNoUsedButton.textContent = 'Nur Karten exportieren';
    headerDiv.appendChild(exportNoUsedButton)
    exportNoUsedButton.onclick = () => {
        exp(copyKarten(ks, false));
    }

    const exportButton = document.createElement('button');
    exportButton.classList.add('floatRight', 'lightButton');
    exportButton.textContent = 'Exportieren';
    headerDiv.appendChild(exportButton)
    exportButton.onclick = () => {
        exp(ks);
    }

    maleNeueKartenInContentDiv(contentDiv, ks);
}


function maleNeueKartenInContentDiv(contentDiv: HTMLDivElement, karten: Karten) {
    contentDiv.innerHTML = '';

    const centerWrapperDiv = document.createElement('div');
    contentDiv.appendChild(centerWrapperDiv);
    centerWrapperDiv.classList.add('centerContent');

    const centerDiv = document.createElement('div');
    centerDiv.classList.add('centerContentInnerDiv')
    centerWrapperDiv.appendChild(centerDiv);

    for (let i = 0; i < karten.length; i++) {
        const karte = karten[i];

        const kDiv = document.createElement('div');
        kDiv.classList.add('karte');
        centerDiv.appendChild(kDiv);
        setClassForKarte(kDiv, karte)

        const title = document.createElement('input');
        title.classList.add('titleInput')
        title.type = 'text';
        title.value = karte.title;
        kDiv.appendChild(title);
        kDiv.appendChild(document.createElement('br'))
        title.oninput = () => {
            karte.title = title.value;
        }

        const text = document.createElement('input');
        text.type = 'text'
        text.classList.add('textInput');
        text.value = karte.text;
        kDiv.appendChild(text);
        kDiv.appendChild(document.createElement('br'))
        text.oninput = () => {
            karte.text = text.value;
        }

        const benutzt = document.createElement('input');
        benutzt.classList.add('benutztInput');
        benutzt.type = 'checkbox';
        benutzt.checked = karte.benutzt;
        const id = 'checkboxBenutzt' + i;
        benutzt.setAttribute('id', id);
        kDiv.appendChild(benutzt);
        benutzt.oninput = () => {
            karte.benutzt = benutzt.checked;
            setClassForKarte(kDiv, karte)
        }
        const benutztLabel = document.createElement('label');
        benutztLabel.classList.add('benutztLabel');
        benutztLabel.setAttribute('for', id);
        benutztLabel.textContent = 'Benutzt'
        kDiv.appendChild(benutztLabel);
        kDiv.appendChild(document.createElement('br'))

        const loeschen = document.createElement('button');
        loeschen.classList.add('loeschenButton');
        loeschen.textContent = 'Karte löschen';
        loeschen.onclick = () => {
            karten.splice(i, 1);
            maleNeueKartenInContentDiv(contentDiv, karten);
        }
        kDiv.appendChild(loeschen);
    }

    const addButton = document.createElement('button');
    addButton.textContent = 'Karte hinzufügen';
    addButton.classList.add('addButton')
    addButton.onclick = () => {
        karten.push({
            title: '',
            text: '',
            benutzt: false
        });
        maleNeueKartenInContentDiv(contentDiv, karten);
    }
    centerDiv.appendChild(addButton);
}

function setClassForKarte(div: HTMLDivElement, karte: Karte) {
    const used = 'benutzt';
    const unused = 'unbenutzt';
    div.classList.remove(used, unused);
    div.classList.add(karte.benutzt ? used : unused);
}

function copyKarten(karten: Karten, benutzt?: boolean): Karten {
    return karten.map(k => {
        return {
            title: k.title,
            text: k.text,
            benutzt: benutzt === undefined ? k.benutzt : benutzt
        }
    })
}