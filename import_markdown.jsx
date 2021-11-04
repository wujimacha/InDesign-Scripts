var _selection;
var source;
var styles = [
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
        tag: 'a',
        type: StyleType.CHARACTER_STYLE_TYPE,
        linked: undefined,
        rules: [{
                re: '\\[([^\\[]+)\\]\\([^\\(]+\\)',
                to: '$1'
            }]
    }
];
var document = app.activeDocument;
var paragraphStyles = document.paragraphStyles;
var characterStyles = document.characterStyles;
var InsertDialogue = (function () {
    function InsertDialogue() {
        this.dialogue = new Window('dialog', "Insert Markdown");
        this.basicStyle = { linked: undefined };
        this.paragraphStyleNames = [];
        this.characterStyleNames = [];
        if (!this.validateSelection()) {
            return;
        }
        for (var i = 0; i < paragraphStyles.length; ++i) {
            this.paragraphStyleNames.push(paragraphStyles[i].name);
        }
        for (var i = 0; i < characterStyles.length; ++i) {
            this.characterStyleNames.push(characterStyles[i].name);
        }
        this.UI();
        if (this.dialogue.show()) {
            return;
        }
        this.applyStyles();
    }
    InsertDialogue.prototype.validateSelection = function () {
        _selection = app.activeDocument.selection[0];
        if (_selection && _selection instanceof TextFrame) {
            var selections = app.activeDocument.selection;
            if (selections.length === 1) {
                return true;
            }
            else {
                alert('Multiple selections. ');
                return false;
            }
        }
        else {
            alert(String(_selection) + ' is not a text frame. ');
            return false;
        }
    };
    InsertDialogue.prototype.importMarkdown = function () {
        var file = File.openDialog('prompt', '*.md', false);
        if (file) {
            var res = file.open('r');
            if (res) {
                this.confirmButton.enabled = true;
                this.filenameLabel.text = file.absoluteURI;
                source = file.read();
            }
            else {
                this.confirmButton.enabled = false;
            }
            file.close();
        }
        else {
            this.confirmButton.enabled = false;
        }
    };
    InsertDialogue.prototype.applyGREP = function (target, style) {
        var item = style.linked.selection;
        for (var i = 0; i < style.rules.length; ++i) {
            var findGrepPreferences = app.findGrepPreferences;
            var changeGrepPreferences = app.changeGrepPreferences;
            findGrepPreferences.findWhat = style.rules[i].re;
            changeGrepPreferences.changeTo = style.rules[i].to;
            if (style.type === StyleType.PARAGRAPH_STYLE_TYPE) {
                changeGrepPreferences.appliedParagraphStyle = paragraphStyles[item.index];
            }
            else {
                changeGrepPreferences.appliedCharacterStyle = characterStyles[item.index];
            }
            var texts = target.findGrep(false);
            for (var j = 0; j < texts.length; ++j) {
                var text = texts[j];
                var originalText = text.contents;
                text.changeGrep(false);
                if (style.tag === 'a') {
                    var re = /\[[^\[]+\]\(([^\(]+)\)/;
                    var matched = re.exec(originalText);
                    var link = matched[1];
                    var destination = document.hyperlinkURLDestinations.add(link);
                    var source_1 = document.hyperlinkTextSources.add(text);
                    document.hyperlinks.add(source_1, destination, { name: text + '_' + j });
                }
            }
            app.findGrepPreferences = app.changeGrepPreferences =
                NothingEnum.NOTHING;
        }
    };
    InsertDialogue.prototype.applyStyles = function () {
        _selection.contents = source.replace(/\n+/g, '\r');
        var paras = _selection.paragraphs.everyItem();
        paras.applyCharacterStyle(characterStyles[0]);
        paras.applyParagraphStyle(paragraphStyles[this.basicStyle.linked.selection.index], true);
        document.hyperlinkTextSources.everyItem().remove();
        document.hyperlinks.everyItem().remove();
        document.hyperlinkURLDestinations.everyItem().remove();
        for (var i = 0; i < styles.length; ++i) {
            this.applyGREP(_selection.parentStory, styles[i]);
        }
    };
    InsertDialogue.prototype.UI = function () {
        var _this = this;
        this.dialogue.alignChildren = 'fill';
        var fileGroup = this.dialogue.add('group');
        this.filenameLabel = fileGroup.add('statictext', undefined, "[Empty]");
        this.filenameLabel.alignment = ['fill', 'middle'];
        this.importButton = fileGroup.add('button', undefined, 'Import...');
        this.importButton.alignment = ['right', 'middle'];
        this.importButton.onClick = function () { return _this.importMarkdown(); };
        var styleGroup = this.dialogue.add('group');
        styleGroup.alignChildren = ['fill', 'fill'];
        var paragraphStylePanel = styleGroup.add('panel', undefined, 'Paragraph Styles');
        paragraphStylePanel.alignChildren = ['fill', 'top'];
        var paragraphStyleDropDownList = function (label) {
            var dropDownList = paragraphStylePanel.add('dropdownlist', undefined, _this.paragraphStyleNames);
            dropDownList.selection = 1;
            dropDownList.text = label;
            return dropDownList;
        };
        this.basicStyle.linked = paragraphStyleDropDownList('Basic:');
        styles[0].linked = paragraphStyleDropDownList('Quote:');
        for (var i = 1; i <= 4; ++i) {
            styles[i].linked = paragraphStyleDropDownList('Heading' + i.toString() + ':');
        }
        var characterStylePanel = styleGroup.add('panel', undefined, 'Character Styles');
        characterStylePanel.alignChildren = ['fill', 'top'];
        var characterStyleDropDownList = function (label) {
            var dropDownList = characterStylePanel.add('dropdownlist', undefined, _this.characterStyleNames);
            dropDownList.selection = 0;
            dropDownList.text = label;
            return dropDownList;
        };
        styles[5].linked = characterStyleDropDownList('Bold:');
        styles[6].linked = characterStyleDropDownList('Emphasis:');
        styles[7].linked = characterStyleDropDownList('Link:');
        var instructButtons = this.dialogue.add('group');
        this.closeButton = instructButtons.add('button', undefined, 'Close');
        this.closeButton.alignment = ['right', 'middle'];
        this.closeButton.onClick = function () { return _this.dialogue.close(1); };
        this.confirmButton = instructButtons.add('button', undefined, 'Insert');
        this.confirmButton.alignment = ['right', 'middle'];
        this.confirmButton.onClick = function () { return _this.dialogue.close(0); };
        this.confirmButton.enabled = false;
    };
    return InsertDialogue;
}());
new InsertDialogue();
