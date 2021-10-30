/// <reference types="types-for-adobe/InDesign/2021"/>

let _selection: TextFrame
let source: string

interface Rule {
    re: string,
    to: string
}

interface Style {
    tag: string,
    type: StyleType,
    linked?: DropDownList,
    rules: Rule[]
}

let styles: Style[] = [
    {
        tag: 'blockquote',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^>\\s*(.*$)',
            to: '$1'
        }]
    }, {
        tag: 'h1',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#\\s+(.*)$',
            to: '$1'
        }]
    }, {
        tag: 'h2',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{2}\\s+(.*)$',
            to: '$1'
        }]
    }, {
        tag: 'h3',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{3}\\s+(.*)$',
            to: '$1'
        }]
    }, {
        tag: 'h4',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{4}\\s+(.*)$',
            to: '$1'
        }]
    }, {
        tag: 'strong',
        type: StyleType.CHARACTER_STYLE_TYPE,
        linked: undefined,
        rules: [
            {
                re: '(\\*{2})([^\\*]+)\\1',
                to: '$2'
            },
            {
                re: '(__)([^_]+)\\1',
                to: '$2'
            }
        ]
    }, {
        tag: 'em',
        type: StyleType.CHARACTER_STYLE_TYPE,
        linked: undefined,
        rules: [
            {
                re: '(\\*)([^\\*]+)\\1',
                to: '$2'
            },
            {
                re: '_([^_]+)_',
                to: '$1'
            }
        ]
    }, {
        tag: 'a',  // Special case
        type: StyleType.CHARACTER_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '\\[([^\\[]+)\\]\\(([^\\(]+)\\)',
            to: '$1'
        }]
    }
]

let document = app.activeDocument
const paragraphStyles = document.paragraphStyles
const characterStyles = document.characterStyles

class InsertDialogue {
    dialogue = new Window('dialog', "Insert Markdown")

    filenameLabel: StaticText
    importButton: Button

    basicStyle = { linked: undefined }

    closeButton: Button
    confirmButton: Button

    paragraphStyleNames: string[] = []
    characterStyleNames: string[] = []


    validateSelection(): boolean {
        _selection = app.activeDocument.selection[0]

        if (_selection && _selection instanceof TextFrame) {
            let selections = app.activeDocument.selection as object[]
            if (selections.length === 1) { return true } else {
                alert('Multiple selections. ')
                return false
            }
        } else {
            alert(String(_selection) + ' is not a text frame. ')
            return false
        }
    }

    importMarkdown() {
        let file = File.openDialog('prompt', '*.md', false)
        if (file) {
            let res = file.open('r')
            if (res) {
                this.confirmButton.enabled = true
                this.filenameLabel.text = file.absoluteURI  // TODO: Style URI
                source = file.read()
            } else { this.confirmButton.enabled = false }

            file.close()
        } else { this.confirmButton.enabled = false  }
    }

    applyGREP(target: Story, style: Style) {
        const item = style.linked.selection as ListItem 

        for (let i = 0; i < style.rules.length; ++i) {
            let findGrepPreferences = app.findGrepPreferences as FindGrepPreference
            let changeGrepPreferences = app.changeGrepPreferences as ChangeGrepPreference

            findGrepPreferences.findWhat = style.rules[i].re
            changeGrepPreferences.changeTo = style.rules[i].to
            if (style.type === StyleType.PARAGRAPH_STYLE_TYPE) {
                changeGrepPreferences.appliedParagraphStyle = paragraphStyles[item.index]
            } else {
                changeGrepPreferences.appliedCharacterStyle = characterStyles[item.index]
            }

            target.changeGrep(false)

            app.findGrepPreferences = app.changeGrepPreferences =
                NothingEnum.NOTHING
        }
    }

    applyStyles() {
        _selection.contents = source.replace(/\n+/g, '\r')

        _selection.paragraphs.anyItem().applyParagraphStyle(
            paragraphStyles[this.basicStyle.linked.selection.index], true
        )

        for (let i = 0; i < styles.length; ++i) {
            this.applyGREP(_selection.parentStory, styles[i])
        }
    }

    UI() {
        this.dialogue.alignChildren = 'fill'

        // BEGIN fileGroup
        let fileGroup = this.dialogue.add('group')
        this.filenameLabel = fileGroup.add('statictext', undefined, "[Empty]")
        this.filenameLabel.alignment = [ 'fill', 'middle' ]

        this.importButton = fileGroup.add('button', undefined, 'Import...')
        this.importButton.alignment = [ 'right', 'middle' ]
        this.importButton.onClick = () => this.importMarkdown()
        // END fileGroup
        
        // BEGIN styleGroup
        let styleGroup = this.dialogue.add('group')
        styleGroup.alignChildren = [ 'fill', 'fill' ]
        
            // BEGIN paragraphStylePanel
            let paragraphStylePanel = styleGroup.add('panel', undefined, 'Paragraph Styles')
            paragraphStylePanel.alignChildren = [ 'fill', 'top' ]

            const paragraphStyleDropDownList = (label: string) => {
                let dropDownList = 
                    paragraphStylePanel.add('dropdownlist', undefined, this.paragraphStyleNames)
                dropDownList.selection = 1
                dropDownList.text = label
                return dropDownList
            }

            this.basicStyle.linked = paragraphStyleDropDownList('Basic:')
            styles[0].linked = paragraphStyleDropDownList('Quote:')

            for (let i = 1; i <= 4; ++i) {
                styles[i].linked = paragraphStyleDropDownList('Heading' + i.toString() + ':')
            }
            // END paragraphStylePanel

            // BEGIN characterStylePanel
            let characterStylePanel = styleGroup.add('panel', undefined, 'Character Styles')
            characterStylePanel.alignChildren = [ 'fill', 'top' ]

            const characterStyleDropDownList = (label: string) => {
                let dropDownList = 
                    characterStylePanel.add('dropdownlist', undefined, this.characterStyleNames)
                dropDownList.selection = 0
                dropDownList.text = label
                return dropDownList
            }

            styles[5].linked = characterStyleDropDownList('Bold:')
            styles[6].linked = characterStyleDropDownList('Emphasis:')
            styles[7].linked = characterStyleDropDownList('Link:')
            // END characterStylePanel
        // END styleGroup
        
        // BEGIN instructButtons
        let instructButtons = this.dialogue.add('group')
        this.closeButton = instructButtons.add('button', undefined, 'Close')
        this.closeButton.alignment = [ 'right', 'middle' ]
        this.closeButton.onClick = () => this.dialogue.close(1)

        this.confirmButton = instructButtons.add('button', undefined, 'Insert')
        this.confirmButton.alignment = [ 'right', 'middle' ]
        this.confirmButton.onClick = () => this.dialogue.close(0)
        this.confirmButton.enabled = false
    }

    constructor() {
        if (!this.validateSelection()) { return }

        for (let i = 0; i < paragraphStyles.length; ++i) {
            this.paragraphStyleNames.push(paragraphStyles[i].name)
        }
        for (let i = 0; i < characterStyles.length; ++i) {
            this.characterStyleNames.push(characterStyles[i].name)
        }

        this.UI()

        if (this.dialogue.show()) { return }

        this.applyStyles()
    }
}

new InsertDialogue()
