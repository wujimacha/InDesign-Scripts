var selection
var source

var styles = [
    {
        tag: 'blockquote',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^>\\s+([^\\n]+)$',
            to: '$1'
        }]
    },
    {
        tag: 'h1',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#\\s+(.+)$',
            to: '$1'
        }]
    },
    {
		tag: 'h2',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{2}\\s+(.+)$',
            to: '$1'
        }]
    },
    {
		tag: 'h3',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{3}\\s+(.+)$',
            to: '$1'
        }]
    },
    {
		tag: 'h4',
        type: StyleType.PARAGRAPH_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '^#{4}\\s+(.+)$',
            to: '$1'
        }]
    },
    {
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
    },
    {
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
    },
    {
		tag: 'a',  // Special case
        type: StyleType.CHARACTER_STYLE_TYPE,
        linked: undefined,
        rules: [{
            re: '\\[([^\\[]+)\\]\\(([^\\(]+)\\)',
            to: '$1'
        }]
    }
]

function showInsertDialogue() {
    var insertDialogue = new Window("dialog", 'Insert Markdown')
    var filenameLabel

    var basicPara = { linked: undefined }

    var importBtn
    var closeBtn
    var confirmBtn

    var paraStyleNames = []
    var paraStyles = app.activeDocument.paragraphStyles
    for (var i = 0; i < paraStyles.length; ++i) {
        paraStyleNames.push(paraStyles[i].name)
    }
    var characterStyleNames = []
    var characterStyles = app.activeDocument.characterStyles
    for (var i = 0; i < characterStyles.length; ++i) {
        characterStyleNames.push(characterStyles[i].name)
    }

    function importMarkdown() {
        var file = File.openDialog('prompt', '*.md', false)
        if (file) {
            var res = file.open('r')
            if (res) {
                confirmBtn.enabled = true
                filenameLabel.text = file.absoluteURI
                source = file.read()
            } else { confirmBtn.enabled = false }
            file.close()
        } else { confirmBtn.enabled = false }
    }

    function grep(target, style) {
        for (var i = 0; i < style.rules.length; ++i) {
            app.findGrepPreferences.properties = { findWhat: style.rules[i].re }
            app.changeGrepPreferences.properties = style.type === StyleType.PARAGRAPH_STYLE_TYPE ? {
                changeTo: style.rules[i].to,
                appliedParagraphStyle: paraStyles[style.linked.selection.index]
            } : {
                changeTo: style.rules[i].to, 
                appliedCharacterStyle: characterStyles[style.linked.selection.index]
            }

            target.changeGrep()

            app.findGrepPreferences = NothingEnum.nothing
            app.changeGrepPreferences = NothingEnum.nothing
        }
    }

    function applyStyles() {
        selection.contents = source.replace(/\n+/g, '\r')

        selection.paragraphs.everyItem().appliedParagraphStyle = 
            paraStyles[basicPara.linked.selection.index]

        for (var i = 0; i < styles.length; ++i) {
            grep(selection.parentStory, styles[i])
        }
    }

    with (insertDialogue) {
        alignChildren = [ 'fill', 'fill' ]

        var fileGroup = add('Group')
        with (fileGroup) {
            filenameLabel = add("statictext", undefined, "[Open Markdown]")
            filenameLabel.alignment = [ 'fill', 'middle' ] 

            importBtn = add('button', undefined, 'Import...')
            importBtn.alignment = [ 'right', 'middle' ]
            importBtn.onClick = function() { importMarkdown() }
        }
        
        var styleGroup = add('group')
        with (styleGroup) {
            alignChildren = [ 'fill', 'fill' ]

            var paraStylePanel = add('panel', undefined, 'Paragraph Styles')
            with (paraStylePanel) {
                alignChildren = [ 'fill', 'top' ]

                function styleDropdownList() {
                    return add('dropdownlist', undefined, paraStyleNames)
                }

                var p = basicPara.linked = styleDropdownList()
                p.text = 'Basic:'
                p.selection = 1
                
                var blockquote = styles[0].linked = styleDropdownList()
                blockquote.text = 'Quote:'
                blockquote.selection = 1

                for (var i = 1; i <= 4; ++i) {
                    var heading = styles[i].linked = styleDropdownList() 
                    heading.text = 'Heading ' + i + ':'
                    heading.selection = 1
                }
            }

            var characterStylePanel = add('panel', undefined, 'Character Styles')
            with (characterStylePanel) {
                alignChildren = [ 'fill', 'top' ]

                function styleDropdownList() {
                    return add('dropdownlist', undefined, characterStyleNames)
                }

                var strong = styles[5].linked = styleDropdownList() 
                strong.text = 'Bold:'
                strong.selection = 0

                var em = styles[6].linked = styleDropdownList()
                em.text = 'Emphasis:'
                em.selection = 0

                var a = styles[7].linked = styleDropdownList()
                a.text = 'Link:'
                a.selection = 0
            }
        }

        var instructBtns = add('group')
        with (instructBtns) {
            closeBtn = add('button', undefined, 'Close')
            closeBtn.alignment = [ 'right', 'middle' ]
            // helpTip
            closeBtn.onClick = function() { close(1) }

            confirmBtn = add('button', undefined, 'Insert')
            confirmBtn.alignment = [ 'right', 'middle' ]
            confirmBtn.onClick = function() { close(0) } 
            confirmBtn.enabled = false
        }
    }

    if (insertDialogue.show()) { return }

    applyStyles()
}

function validateSelection() {
    selection = app.activeDocument.selection[0]
    return (selection && selection instanceof TextFrame)
}

function main() {
    if (!validateSelection()) {
        alert(selection + ' is not a text frame.')
        return
    }

    showInsertDialogue()
}

main()
