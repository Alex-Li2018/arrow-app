(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ArrowApp = factory());
})(this, (function () { 'use strict';

    const defaultNodeRadius = 50;
    const ringMargin = 10;
    const relationshipHitTolerance = 20;
    const defaultFontSize = 50;

    const black = '#000000';
    const white = '#ffffff';

    const selectionBorder = '#B3D7FF';
    const selectionHandle = '#2284D0';

    const googleFonts = [{
            fontFamily: 'Nunito Sans',
        },
        {
            fontFamily: 'Nunito',
        },
        {
            fontFamily: 'Fira Code',
        },
        {
            fontFamily: 'Bentham',
        },
        {
            fontFamily: 'Kalam',
        },
        {
            fontFamily: 'Caveat',
        },
    ];

    const styleAttributeGroups = [{
            name: 'General',
            entityTypes: ['node', 'relationship'],
            attributes: [{
                    key: 'font-family',
                    appliesTo: 'Everything',
                    type: 'font-family',
                    defaultValue: 'sans-serif'
                },
                {
                    key: 'background-color',
                    appliesTo: 'Everything',
                    type: 'color',
                    defaultValue: white
                },
                {
                    key: 'background-image',
                    appliesTo: 'Everything',
                    type: 'image',
                    defaultValue: ''
                },
                {
                    key: 'background-size',
                    appliesTo: 'Everything',
                    type: 'percentage',
                    defaultValue: '100%'
                },
            ]
        },
        {
            name: 'Nodes',
            entityTypes: ['node'],
            attributes: [{
                    key: 'node-color',
                    appliesTo: 'Node',
                    type: 'color',
                    defaultValue: white
                },
                {
                    key: 'border-width',
                    appliesTo: 'Node',
                    type: 'line-width',
                    defaultValue: 4
                },
                {
                    key: 'border-color',
                    appliesTo: 'NodeWithBorder',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'radius',
                    appliesTo: 'Node',
                    type: 'radius',
                    defaultValue: defaultNodeRadius
                },
                {
                    key: 'node-padding',
                    appliesTo: 'NodeWithInsideDetail',
                    type: 'spacing',
                    defaultValue: 5
                },
                {
                    key: 'node-margin',
                    appliesTo: 'NodeWithOutsideDetail',
                    type: 'spacing',
                    defaultValue: 2
                },
                {
                    key: 'outside-position',
                    appliesTo: 'NodeWithOutsideDetail',
                    type: 'outside-position',
                    defaultValue: 'auto'
                },
                {
                    key: 'node-icon-image',
                    appliesTo: 'Node',
                    type: 'image',
                    defaultValue: ''
                },
                {
                    key: 'node-background-image',
                    appliesTo: 'Node',
                    type: 'image',
                    defaultValue: ''
                },
            ]
        },
        {
            name: 'Icons',
            entityTypes: ['node'],
            attributes: [{
                    key: 'icon-position',
                    appliesTo: 'NodeWithIcon',
                    type: 'inside-outside',
                    defaultValue: 'inside'
                },
                {
                    key: 'icon-size',
                    appliesTo: 'NodeOrRelationshipWithIcon',
                    type: 'radius',
                    defaultValue: 64
                }
            ]
        },
        {
            name: 'Node Captions',
            entityTypes: ['node'],
            attributes: [{
                    key: 'caption-position',
                    appliesTo: 'NodeWithCaption',
                    type: 'inside-outside',
                    defaultValue: 'inside'
                },
                {
                    key: 'caption-max-width',
                    appliesTo: 'NodeWithCaptionOutside',
                    type: 'radius',
                    defaultValue: 200
                },
                {
                    key: 'caption-color',
                    appliesTo: 'NodeWithCaption',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'caption-font-size',
                    appliesTo: 'NodeWithCaption',
                    type: 'font-size',
                    defaultValue: defaultFontSize
                },
                {
                    key: 'caption-font-weight',
                    appliesTo: 'NodeWithCaption',
                    type: 'font-weight',
                    defaultValue: 'normal'
                },
            ]
        },
        {
            name: 'Node Labels',
            entityTypes: ['node'],
            attributes: [{
                    key: 'label-position',
                    appliesTo: 'NodeWithLabel',
                    type: 'inside-outside',
                    defaultValue: 'inside'
                },
                {
                    key: 'label-display',
                    appliesTo: 'NodeWithLabel',
                    type: 'label-display',
                    defaultValue: 'pill'
                },
                {
                    key: 'label-color',
                    appliesTo: 'NodeWithLabel',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'label-background-color',
                    appliesTo: 'NodeWithLabel',
                    type: 'color',
                    defaultValue: white
                },
                {
                    key: 'label-border-color',
                    appliesTo: 'NodeWithLabel',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'label-border-width',
                    appliesTo: 'NodeWithLabel',
                    type: 'line-width',
                    defaultValue: 4
                },
                {
                    key: 'label-font-size',
                    appliesTo: 'NodeWithLabel',
                    type: 'font-size',
                    defaultValue: defaultFontSize * (4 / 5)
                },
                {
                    key: 'label-padding',
                    appliesTo: 'NodeWithLabel',
                    type: 'spacing',
                    defaultValue: 5
                },
                {
                    key: 'label-margin',
                    appliesTo: 'NodeWithLabel',
                    type: 'spacing',
                    defaultValue: 4
                },
            ]
        },
        {
            name: 'Arrows',
            entityTypes: ['relationship'],
            attributes: [{
                    key: 'directionality',
                    appliesTo: 'Relationship',
                    type: 'directionality',
                    defaultValue: 'directed'
                },
                {
                    key: 'detail-position',
                    appliesTo: 'RelationshipWithDetail',
                    type: 'detail-position',
                    defaultValue: 'inline'
                },
                {
                    key: 'detail-orientation',
                    appliesTo: 'RelationshipWithDetail',
                    type: 'orientation',
                    defaultValue: 'parallel'
                },
                {
                    key: 'arrow-width',
                    appliesTo: 'Relationship',
                    type: 'line-width',
                    defaultValue: 5
                },
                {
                    key: 'arrow-color',
                    appliesTo: 'Relationship',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'margin-start',
                    appliesTo: 'Relationship',
                    type: 'spacing',
                    defaultValue: 5
                },
                {
                    key: 'margin-end',
                    appliesTo: 'Relationship',
                    type: 'spacing',
                    defaultValue: 5
                },
                {
                    key: 'margin-peer',
                    appliesTo: 'Relationship',
                    type: 'spacing',
                    defaultValue: 20
                },
                {
                    key: 'attachment-start',
                    appliesTo: 'Relationship',
                    type: 'attachment',
                    defaultValue: 'normal'
                },
                {
                    key: 'attachment-end',
                    appliesTo: 'Relationship',
                    type: 'attachment',
                    defaultValue: 'normal'
                },
                {
                    key: 'relationship-icon-image',
                    appliesTo: 'Relationship',
                    type: 'image',
                    defaultValue: ''
                }
            ]
        },
        {
            name: 'Relationship Types',
            entityTypes: ['relationship'],
            attributes: [{
                    key: 'type-color',
                    appliesTo: 'RelationshipWithType',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'type-background-color',
                    appliesTo: 'RelationshipWithType',
                    type: 'color',
                    defaultValue: white
                },
                {
                    key: 'type-border-color',
                    appliesTo: 'RelationshipWithType',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'type-border-width',
                    appliesTo: 'RelationshipWithType',
                    type: 'line-width',
                    defaultValue: 0
                },
                {
                    key: 'type-font-size',
                    appliesTo: 'RelationshipWithType',
                    type: 'font-size',
                    defaultValue: 16
                },
                {
                    key: 'type-padding',
                    appliesTo: 'RelationshipWithType',
                    type: 'spacing',
                    defaultValue: 5
                }
            ]
        },
        {
            name: 'Properties',
            entityTypes: ['node', 'relationship'],
            attributes: [{
                    key: 'property-position',
                    appliesTo: 'NodeOrRelationshipWithProperty',
                    type: 'inside-outside',
                    defaultValue: 'outside'
                },
                {
                    key: 'property-alignment',
                    appliesTo: 'NodeOrRelationshipWithProperty',
                    type: 'property-alignment',
                    defaultValue: 'colon'
                },
                {
                    key: 'property-color',
                    appliesTo: 'NodeOrRelationshipWithProperty',
                    type: 'color',
                    defaultValue: black
                },
                {
                    key: 'property-font-size',
                    appliesTo: 'NodeOrRelationshipWithProperty',
                    type: 'font-size',
                    defaultValue: 16
                },
                {
                    key: 'property-font-weight',
                    appliesTo: 'NodeOrRelationshipWithProperty',
                    type: 'font-weight',
                    defaultValue: 'normal'
                },
            ]
        }
    ];

    const styleAttributes = Object.fromEntries(
        styleAttributeGroups.flatMap(group => group.attributes)
        .map(attribute => [attribute.key, attribute]));

    styleAttributeGroups
        .filter(group => group.entityTypes.includes('node'))
        .flatMap(group => group.attributes)
        .map(attribute => attribute.key);

    styleAttributeGroups
        .filter(group => group.entityTypes.includes('relationship'))
        .flatMap(group => group.attributes)
        .map(attribute => attribute.key);

    styleAttributeGroups
        .flatMap(group => group.attributes)
        .filter(attribute => attribute.type === 'image')
        .map(attribute => attribute.key);

    const styleTypes = {
        'radius': {
            editor: 'slider',
            min: 1,
            max: 1000,
            step: 5
        },
        'line-width': {
            editor: 'slider',
            min: 0,
            max: 25,
            step: 1
        },
        'spacing': {
            editor: 'slider',
            min: 0,
            max: 50,
            step: 1
        },
        'font-size': {
            editor: 'slider',
            min: 5,
            max: 100,
            step: 1
        },
        'color': {
            editor: 'colorPicker'
        },
        'font-family': {
            editor: 'dropdown',
            options: ['sans-serif', ...googleFonts.map(font => font.fontFamily)]
        },
        'font-weight': {
            editor: 'dropdown',
            options: ['normal', 'bold']
        },
        'directionality': {
            editor: 'dropdown',
            options: ['directed', 'undirected']
        },
        'outside-position': {
            editor: 'dropdown',
            options: ['auto', 'top-left', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left']
        },
        'inside-outside': {
            editor: 'dropdown',
            options: ['inside', 'outside']
        },
        'detail-position': {
            editor: 'dropdown',
            options: ['inline', 'above', 'below']
        },
        'orientation': {
            editor: 'dropdown',
            options: ['parallel', 'perpendicular', 'horizontal']
        },
        'property-alignment': {
            editor: 'dropdown',
            options: ['colon', 'center']
        },
        'label-display': {
            editor: 'dropdown',
            options: ['pill', 'bare']
        },
        'attachment': {
            editor: 'dropdown',
            options: ['normal', 'top', 'right', 'bottom', 'left']
        },
        'image': {
            editor: 'imageUrl'
        },
        'percentage': {
            editor: 'percentageSlider',
            min: 5,
            max: 1000,
            step: 5
        },
    };

    const validate = (styleKey, value) => {
        const styleAttribute = styleAttributes[styleKey];
        const styleType = styleTypes[styleAttribute.type];
        switch (styleType.editor) {
            case 'slider':
            case 'percentageSlider':
                if (!isNaN(value)) {
                    if (value < styleType.min) {
                        return styleType.min
                    }
                    if (value > styleType.max) {
                        return styleType.max
                    }
                    return value
                }
                break

            case "colorPicker":
                if (/^#[0-9A-F]{6}$/i.test(value)) {
                    return value
                }
                break

            case "dropdown":
                if (styleType.options.includes(value)) {
                    return value
                }
                break

            case "imageUrl":
                return value
        }
        return styleAttribute.defaultValue
    };

    const graphStyleSelector = graph => graph.style || {};

    const specificOrGeneral = (styleKey, entity, graphStyle) => {
        if (entity.style && entity.style.hasOwnProperty(styleKey)) {
            return entity.style[styleKey]
        }
        return graphStyle[styleKey]
    };

    const getStyleSelector = (entity, styleKey, graph) => {
        const styleMap = graphStyleSelector(graph);
        return validate(styleKey, specificOrGeneral(styleKey, entity, styleMap))
    };

    class Vector {
        constructor(dx, dy) {
            this.dx = dx;
            this.dy = dy;
        }

        plus(otherVector) {
            return new Vector(this.dx + otherVector.dx, this.dy + otherVector.dy)
        }

        minus(otherVector) {
            return new Vector(this.dx - otherVector.dx, this.dy - otherVector.dy)
        }

        scale(scaleFactor) {
            return new Vector(this.dx * scaleFactor, this.dy * scaleFactor)
        }

        dot(vector) {
            return this.dx * vector.dx + this.dy * vector.dy
        }

        invert() {
            return new Vector(-this.dx, -this.dy)
        }

        rotate(angle) {
            return new Vector(
                this.dx * Math.cos(angle) - this.dy * Math.sin(angle),
                this.dx * Math.sin(angle) + this.dy * Math.cos(angle)
            )
        }

        perpendicular() {
            return new Vector(-this.dy, this.dx)
        }

        distance() {
            return Math.sqrt(this.dx * this.dx + this.dy * this.dy)
        }

        unit() {
            return this.scale(1 / this.distance())
        }

        angle() {
            return Math.atan2(this.dy, this.dx)
        }

        get dxdy() {
            return [this.dx, this.dy]
        }

        asCSSTransform() {
            return `translate(${this.dx}px,${this.dy}px)`
        }
    }

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        vectorFrom(otherPoint) {
            return new Vector(this.x - otherPoint.x, this.y - otherPoint.y)
        }

        vectorFromOrigin() {
            return new Vector(this.x, this.y)
        }

        scale(scaleFactor) {
            return new Point(this.x * scaleFactor, this.y * scaleFactor)
        }

        translate(vector) {
            return new Point(this.x + vector.dx, this.y + vector.dy)
        }

        rotate(angle) {
            return new Point(
                this.x * Math.cos(angle) - this.y * Math.sin(angle),
                this.x * Math.sin(angle) + this.y * Math.cos(angle)
            )
        }

        isEqual(point) {
            return this.x === point.x && this.y === point.y
        }

        get xy() {
            return [this.x, this.y]
        }
    }

    new Point(0, 0);

    class BoundingBox {
        constructor(left, right, top, bottom) {
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
        }

        get width() {
            return this.right - this.left
        }

        get height() {
            return this.bottom - this.top
        }

        corners() {
            return [
                new Point(this.left, this.top),
                new Point(this.right, this.top),
                new Point(this.left, this.bottom),
                new Point(this.right, this.bottom)
            ]
        }

        combine(other) {
            return new BoundingBox(
                Math.min(this.left, other.left),
                Math.max(this.right, other.right),
                Math.min(this.top, other.top),
                Math.max(this.bottom, other.bottom)
            )
        }

        scale(scaleFactor) {
            return new BoundingBox(
                this.left * scaleFactor,
                this.right * scaleFactor,
                this.top * scaleFactor,
                this.bottom * scaleFactor
            )
        }

        translate(vector) {
            return new BoundingBox(
                this.left + vector.dx,
                this.right + vector.dx,
                this.top + vector.dy,
                this.bottom + vector.dy
            )
        }

        contains(point) {
            return (
                point.x >= this.left && point.x <= this.right &&
                point.y >= this.top && point.y <= this.bottom
            )
        }

        containsBoundingBox(other) {
            return (
                this.left <= other.left && this.right >= other.right &&
                this.top <= other.top && this.bottom >= other.bottom
            )
        }
    }

    const combineBoundingBoxes = (boundingBoxes) => {
        return boundingBoxes.reduce((accumulator, value) => accumulator ? accumulator.combine(value) : value, null)
    };

    const boundingBoxOfPoints = (points) => {
        const xCoordinates = points.map(point => point.x);
        const yCoordinates = points.map(point => point.y);
        return new BoundingBox(
            Math.min(...xCoordinates),
            Math.max(...xCoordinates),
            Math.min(...yCoordinates),
            Math.max(...yCoordinates)
        )
    };

    const adaptForBackground = (color, style) => {
        const backgroundColor = style('background-color');
        return adapt(color, backgroundColor)
    };

    const adapt = (() => {
        const factory = (colorString, backgroundColorString) => {
            const color = parse(colorString);
            const distanceFromWhite = color.distance(parse(white));
            const vectorFromWhite = color.minus(parse(white));
            const backgroundColor = parse(backgroundColorString);
            const primary = backgroundColor.plus(vectorFromWhite).normalise();
            const secondary = backgroundColor.plus(vectorFromWhite.scale(0.5)).normalise();
            const bestColor = Math.abs(distanceFromWhite - primary.distance(backgroundColor)) <
                Math.abs(distanceFromWhite - secondary.distance(backgroundColor)) ? primary : secondary;
            return bestColor.toString()
        };

        return factory
    })();

    const parse = (colorString) => new ColorVector(components(colorString));

    const components = (colorString) => [1, 3, 5].map(index =>
        Number.parseInt(colorString.substring(index, index + 2), 16));

    class ColorVector {
        constructor(components) {
            this.components = components;
        }

        minus(that) {
            return new ColorVector(this.components.map((component, i) => component - that.components[i]))
        }

        plus(that) {
            return new ColorVector(this.components.map((component, i) => component + that.components[i]))
        }

        distance(that) {
            return this.components
                .map((component, i) => Math.abs(component - that.components[i]))
                .reduce((a, b) => a + b, 0)
        }

        scale(factor) {
            return new ColorVector(this.components.map((component) => component * factor))
        }

        normalise() {
            return new ColorVector(this.components.map((component) => {
                let value = Math.floor(component);
                while (value < 0) {
                    value += 256;
                }
                while (value > 255) {
                    value -= 256;
                }
                return value
            }))
        }

        toString() {
            return '#' + this.components.map(c => {
                const hex = Math.abs(c).toString(16);
                return hex.length > 1 ? hex : '0' + hex
            }).join('')
        }
    }

    class Pill {
        constructor(text, editing, style, textMeasurement) {
            this.text = text;

            this.backgroundColor = style('label-background-color');
            this.strokeColor = style('label-border-color');
            this.fontColor = style('label-color');
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
            this.borderWidth = style('label-border-width');
            this.display = style('label-display');

            const padding = style('label-padding');

            this.font = {
                fontWeight: 'normal',
                fontSize: style('label-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            this.textWidth = textMeasurement.measureText(text).width;

            this.height = this.font.fontSize + padding * 2 + this.borderWidth;
            this.radius = this.display === 'pill' ? this.height / 2 : 0;
            this.width = this.textWidth + this.radius * 2;

            this.editing = editing;
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = this.backgroundColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.borderWidth;
            if (this.display === 'pill') {
                ctx.rect(0, 0, this.width, this.height, this.radius, true, this.borderWidth > 0);
            }

            if (!this.editing) {
                ctx.font = this.font;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = this.fontColor;
                ctx.fillText(this.text, this.radius, this.height / 2);
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = indicatorWidth;
            ctx.lineJoin = 'round';
            ctx.rect(-this.borderWidth / 2, -this.borderWidth / 2,
                this.width + this.borderWidth, this.height + this.borderWidth,
                this.radius + this.borderWidth / 2, false, true
            );
            ctx.restore();
        }

        contains(localPoint) {
            const rectangle = new BoundingBox(this.radius, this.width, 0, this.height);
            const leftCenter = new Point(this.radius, this.radius);
            const rightCenter = new Point(this.radius + this.width, this.radius);
            return rectangle.contains(localPoint) ||
                leftCenter.vectorFrom(localPoint).distance() < this.radius ||
                rightCenter.vectorFrom(localPoint).distance() < this.radius
        }

        boundingBox() {
            return new BoundingBox(-this.borderWidth / 2,
                this.width + this.borderWidth / 2, -this.borderWidth / 2,
                this.height + this.borderWidth / 2
            )
        }
    }

    class NodeLabelsOutsideNode {
        constructor(labels, orientation, editing, style, textMeasurement) {
            this.pills = labels.map((label) => {
                return new Pill(label, editing, style, textMeasurement)
            });

            this.margin = style('label-margin');

            if (labels.length > 0) {
                const lineHeight = this.pills[0].height + this.margin + this.pills[0].borderWidth;

                this.pillPositions = this.pills.map((pill, i) => {
                    const pillWidth = pill.width + pill.borderWidth;
                    const horizontalPosition = (() => {
                        switch (orientation.horizontal) {
                            case 'start':
                                return 0
                            case 'center':
                                return -pillWidth / 2
                            case 'end':
                                return -pillWidth
                        }
                    })();
                    return new Vector(
                        horizontalPosition,
                        i * lineHeight
                    )
                });
            }

            this.width = Math.max(...this.pills.map(pill => pill.width + pill.borderWidth));
            const lastPillIndex = this.pills.length - 1;
            this.height = this.pillPositions[lastPillIndex].dy +
                this.pills[lastPillIndex].height + this.pills[lastPillIndex].borderWidth;
        }

        get type() {
            return 'LABELS'
        }

        get isEmpty() {
            return this.pills.length === 0
        }

        draw(ctx) {

            for (let i = 0; i < this.pills.length; i++) {
                ctx.save();

                ctx.translate(...this.pillPositions[i].dxdy);
                this.pills[i].draw(ctx);

                ctx.restore();
            }
        }

        drawSelectionIndicator(ctx) {
            for (let i = 0; i < this.pills.length; i++) {
                ctx.save();

                ctx.translate(...this.pillPositions[i].dxdy);
                this.pills[i].drawSelectionIndicator(ctx);

                ctx.restore();
            }
        }

        boundingBox() {
            return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox()
                .translate(this.pillPositions[i])))
        }

        distanceFrom(point) {
            return this.pills.some((pill, i) => {
                const localPoint = point.translate(this.pillPositions[i].invert());
                return pill.contains(localPoint);
            }) ? 0 : Infinity
        }
    }

    const drawTextLine = (ctx, line, position, alignment) => {
        ctx.textAlign = alignment;
        ctx.fillText(line, position.x, position.y);
    };

    const fitTextToRectangle = (text, maxWidth, measureWidth) => {

        const words = text.split(' ');
        const lines = [];
        const newLine = () => ({
            index: lines.length
        });
        let currentLine = newLine();
        const pushCurrentLineUnlessEmpty = () => {
            if (currentLine.hasOwnProperty('text')) {
                lines.push(currentLine);
            }
        };
        const currentLineWithExtraWord = (word) => {
            if (currentLine.text) {
                return currentLine.text + ' ' + word;
            } else {
                return word;
            }
        };

        while (words.length > 0) {
            if (currentLine.text && measureWidth(currentLineWithExtraWord(words[0])) > maxWidth) {
                pushCurrentLineUnlessEmpty();
                currentLine = newLine();
            } else {
                currentLine.text = currentLineWithExtraWord(words.shift());
            }
        }
        if (words.length === 0) {
            pushCurrentLineUnlessEmpty();
        }
        const basicLayout = {
            lines
        };

        const spacePerLine = (line) => {
            return maxWidth - measureWidth(line.text)
        };
        const biggestGap = layout => Math.max(...layout.lines.map(spacePerLine));

        const layoutWithSwappedLines = (layout) => {
            const gappyLines = layout.lines.sort((a, b) => spacePerLine(b) - spacePerLine(a));
            const mostGappy = gappyLines[0];
            const lineAbove = layout.lines.filter(line => line.index === mostGappy.index - 1)[0];
            if (lineAbove) {
                const wordsAbove = lineAbove.text.split(' ');
                const lastWord = wordsAbove[wordsAbove.length - 1];
                const newLineAbove = { ...lineAbove,
                    text: wordsAbove.slice(0, -1).join(' ')
                };
                const newGappyLine = { ...mostGappy,
                    text: lastWord + ' ' + mostGappy.text
                };
                if (spacePerLine(newGappyLine) > 0) {
                    return ({ ...layout,
                        lines: layout.lines.map(line => {
                            if (line.index === newLineAbove.index) {
                                return newLineAbove
                            } else if (line.index === newGappyLine.index) {
                                return newGappyLine
                            } else {
                                return line
                            }
                        })
                    })
                }
            }
        };

        const moreLayouts = (() => {
            const layouts = [];
            let currentLayout = basicLayout;
            while (currentLayout) {
                layouts.push(currentLayout);
                currentLayout = layoutWithSwappedLines(currentLayout);
            }
            return layouts
        })();

        const bestLayout = moreLayouts.slice(0).sort((a, b) => biggestGap(a) - biggestGap(b))[0];

        return {
            actualWidth: Math.max(...bestLayout.lines.map(line => measureWidth(line.text))),
            margin: measureWidth(' '),
            lines: bestLayout.lines.sort((a, b) => a.index - b.index).map(line => line.text)
        }
    };

    class NodeCaptionInsideNode {
        constructor(caption, editing, style, textMeasurement) {
            this.editing = editing;
            this.font = {
                fontWeight: style('caption-font-weight'),
                fontSize: style('caption-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            this.fontColor = style('caption-color');
            this.orientation = {
                horizontal: 'center',
                vertical: 'center'
            };
            this.lineHeight = this.font.fontSize * 1.2;
            const measureWidth = (string) => textMeasurement.measureText(string).width;
            this.layout = fitTextToRectangle(caption, style('caption-max-width'), measureWidth);
            this.width = this.layout.actualWidth;
            this.height = this.layout.lines.length * this.lineHeight;
        }

        get type() {
            return 'CAPTION'
        }

        draw(ctx) {
            if (this.editing) return

            ctx.save();

            ctx.fillStyle = this.fontColor;
            ctx.font = this.font;
            ctx.textBaseline = 'middle';

            const lines = this.layout.lines;

            for (let i = 0; i < lines.length; i++) {
                const yPos = (i + 0.5) * this.lineHeight;
                const position = new Point(0, yPos);
                drawTextLine(ctx, lines[i], position, 'center');
            }

            ctx.restore();
        }

        get contentsFit() {
            return true
        }

        boundingBox() {
            return new BoundingBox(-this.width / 2,
                this.width / 2,
                0,
                this.height
            )
        }

        distanceFrom(point) {
            return point.vectorFromOrigin().distance()
        }
    }

    const isImageInfoLoaded = (imageInfo) => {
        return imageInfo && imageInfo.status === 'LOADED'
    };

    const getCachedImage = (cachedImages, imageUrl) => {
        return cachedImages[imageUrl] || {
            status: 'UNKNOWN',
            errorMessage: 'Image not cached',
            image: document.createElement('img'),
            width: 0,
            height: 0
        }
    };

    class NodeBackground {
        constructor(position, internalRadius, editing, style, imageCache) {
            this.position = position;
            this.internalRadius = internalRadius;
            this.editing = editing;
            this.backgroundColor = style('node-color');
            this.borderWidth = style('border-width');
            this.borderColor = style('border-color');
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
            const backgroundImageUrl = style('node-background-image');
            if (!!backgroundImageUrl) {
                this.imageInfo = getCachedImage(imageCache, backgroundImageUrl);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = this.backgroundColor;
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth / 2, true, this.borderWidth > 0);
            if (!!this.imageInfo) {
                ctx.imageInCircle(this.imageInfo, this.position.x, this.position.y, this.internalRadius);
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            ctx.save();
            const indicatorWidth = 10;
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = indicatorWidth;
            ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth, false, true);
            ctx.restore();
        }
    }

    class PropertiesBox {
        constructor(properties, editing, style, textMeasurement) {
            this.editing = editing;
            this.font = {
                fontWeight: style('property-font-weight'),
                fontSize: style('property-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            this.fontColor = style('property-color');
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
            this.lineHeight = this.font.fontSize * 1.2;
            this.alignment = style('property-alignment');
            this.properties = Object.keys(properties).map(key => ({
                key,
                value: properties[key]
            }));
            this.spaceWidth = textMeasurement.measureText(' ').width;
            this.colonWidth = textMeasurement.measureText(':').width;
            const maxWidth = (selector) => {
                if (this.properties.length === 0) return 0
                return Math.max(...this.properties.map(property => {
                    return textMeasurement.measureText(selector(property)).width
                }))
            };

            switch (this.editing ? 'colon' : this.alignment) {
                case 'colon':
                    this.keysWidth = maxWidth(property => property.key) + this.spaceWidth;
                    this.valuesWidth = maxWidth(property => property.value) + this.spaceWidth;
                    this.boxWidth = this.keysWidth + this.colonWidth + this.spaceWidth + this.valuesWidth;
                    break

                case 'center':
                    this.boxWidth = maxWidth(property => property.key + ': ' + property.value);
                    break
            }
            this.boxHeight = this.lineHeight * this.properties.length;
        }

        get isEmpty() {
            return this.properties.length === 0
        }

        draw(ctx) {
            ctx.save();

            ctx.font = this.font;
            ctx.fillStyle = this.fontColor;
            ctx.textBaseline = 'middle';

            this.properties.forEach((property, index) => {
                const yPosition = (index + 0.5) * this.lineHeight;
                if (this.editing) {
                    drawTextLine(ctx, ':', new Point(this.keysWidth + this.colonWidth, yPosition), 'end');
                } else {
                    switch (this.alignment) {
                        case 'colon':
                            drawTextLine(ctx, property.key + ':', new Point(this.keysWidth + this.colonWidth, yPosition), 'end');
                            drawTextLine(ctx, property.value, new Point(this.keysWidth + this.colonWidth + this.spaceWidth, yPosition), 'start');
                            break

                        case 'center':
                            drawTextLine(ctx, property.key + ': ' + property.value, new Point(this.boxWidth / 2, yPosition), 'center');
                            break
                    }
                }
            });

            ctx.restore();
        }

        drawBackground(ctx) {
            const boundingBox = this.boundingBox();
            ctx.fillStyle = 'white';
            ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, true, false);
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            const boundingBox = this.boundingBox();

            ctx.save();

            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = indicatorWidth;
            ctx.lineJoin = 'round';
            ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true);

            ctx.restore();
        }

        boundingBox() {
            return new BoundingBox(0, this.boxWidth, 0, this.boxHeight)
        }
    }

    class PropertiesOutside {
        constructor(properties, orientation, editing, style, textMeasurement) {
            this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement);
            this.width = this.propertiesBox.boxWidth;
            this.height = this.propertiesBox.boxHeight;
            const horizontalPosition = (() => {
                switch (orientation.horizontal) {
                    case 'start':
                        return 0
                    case 'center':
                        return -this.width / 2
                    case 'end':
                        return -this.width
                }
            })();
            this.boxPosition = new Point(horizontalPosition, 0);
        }

        get type() {
            return 'PROPERTIES'
        }

        get isEmpty() {
            return this.propertiesBox.isEmpty
        }

        draw(ctx) {
            if (!this.isEmpty) {
                ctx.save();

                ctx.translate(...this.boxPosition.xy);
                this.propertiesBox.drawBackground(ctx);
                this.propertiesBox.draw(ctx);

                ctx.restore();
            }
        }

        drawSelectionIndicator(ctx) {
            ctx.save();
            ctx.translate(...this.boxPosition.xy);
            this.propertiesBox.drawSelectionIndicator(ctx);
            ctx.restore();
        }

        boundingBox() {
            return this.propertiesBox.boundingBox().translate(this.boxPosition.vectorFromOrigin())
        }

        distanceFrom(point) {
            return this.boundingBox().contains(point) ? 0 : Infinity
        }
    }

    const otherNodeId = (relationship, nodeId) => {
        if (relationship.fromId === nodeId) {
            return relationship.toId
        }
        if (relationship.toId === nodeId) {
            return relationship.fromId
        }
        return undefined
    };

    const neighbourPositions = (node, graph) => {
        return graph.relationships
            .filter(relationship => node.id === relationship.fromId || node.id === relationship.toId)
            // 不直接指向自己
            .filter(relationship => relationship.fromId !== relationship.toId)
            .map(relationship => {
                const otherId = otherNodeId(relationship, node.id);
                const otherNode = graph.nodes.find(otherNode => otherNode.id === otherId);
                return otherNode.position
            })
    };

    class NodeCaptionOutsideNode {
        constructor(caption, orientation, editing, style, textMeasurement) {
            this.caption = caption;
            this.orientation = orientation;
            this.editing = editing;
            this.font = {
                fontWeight: style('caption-font-weight'),
                fontSize: style('caption-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            this.fontColor = style('caption-color');
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
            this.lineHeight = this.font.fontSize * 1.2;
            const measureWidth = (string) => textMeasurement.measureText(string).width;
            this.layout = fitTextToRectangle(caption, style('caption-max-width'), measureWidth);
            this.width = this.layout.actualWidth;
            this.height = this.layout.lines.length * this.lineHeight;
            const horizontalPosition = (() => {
                switch (orientation.horizontal) {
                    case 'start':
                        return 0
                    case 'center':
                        return -this.width / 2
                    case 'end':
                        return -this.width
                }
            })();
            this.boxPosition = new Point(horizontalPosition, 0);
        }

        get type() {
            return 'CAPTION'
        }

        draw(ctx) {
            if (this.editing) return

            ctx.save();

            ctx.fillStyle = this.fontColor;
            ctx.font = this.font;
            ctx.textBaseline = 'middle';

            const lines = this.layout.lines;

            for (let i = 0; i < lines.length; i++) {
                const yPos = (i + 0.5) * this.lineHeight;
                const position = new Point(0, yPos);
                drawTextLine(ctx, lines[i], position, this.orientation.horizontal);
            }

            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            const boundingBox = this.boundingBox();
            ctx.save();
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = indicatorWidth;
            ctx.lineJoin = 'round';
            ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true);
            ctx.restore();
        }

        get contentsFit() {
            return true
        }

        boundingBox() {
            const left = this.boxPosition.x;
            const top = this.boxPosition.y;

            return new BoundingBox(left, left + this.width, top, top + this.height)
        }

        distanceFrom(point) {
            return this.boundingBox().contains(point) ? 0 : Infinity
        }
    }

    class NodePropertiesInside {
        constructor(properties, editing, style, textMeasurement) {
            this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement);
            this.width = this.propertiesBox.boxWidth;
            this.height = this.propertiesBox.boxHeight;
            this.boxPosition = new Point(-this.width / 2, 0);
        }

        get type() {
            return 'PROPERTIES'
        }

        get isEmpty() {
            return this.propertiesBox.isEmpty
        }

        draw(ctx) {
            if (!this.isEmpty) {
                ctx.save();

                ctx.translate(...this.boxPosition.xy);
                this.propertiesBox.draw(ctx);

                ctx.restore();
            }
        }

        boundingBox() {
            return this.propertiesBox.boundingBox().translate(this.boxPosition.vectorFromOrigin())
        }

        distanceFrom(point) {
            return this.boundingBox().contains(point) ? 0 : Infinity
        }
    }

    const bisect = (f, start, minimum) => {
        if (f(start)) return start

        let above = start;
        let below = minimum;
        let result = false;
        while ((above - below) / below > 1e-2) {
            const x = below + (above - below) / 2;
            result = f(x);
            if (result) {
                below = x;
            } else {
                above = x;
            }
        }
        if (!result) {
            f(below);
        }
        return below
    };

    class NodeLabelsInsideNode {
        constructor(labels, editing, style, textMeasurement) {

            this.pills = labels.map((label) => {
                return new Pill(label, editing, style, textMeasurement)
            });

            this.margin = style('label-margin');
            let yPos = 0;

            this.pillPositions = [];
            for (let i = 0; i < this.pills.length; i++) {
                const pill = this.pills[i];
                this.pillPositions[i] = new Vector(-pill.width / 2,
                    yPos
                );
                yPos += (pill.height + pill.borderWidth + this.margin);
            }

            this.width = this.pills.reduce((width, pill) => Math.max(width, pill.width), 0);
            this.height = this.pills.reduce((sum, pill) => sum + pill.height, 0) +
                this.margin * (this.pills.length - 1);
        }

        get type() {
            return 'LABELS'
        }

        get isEmpty() {
            return this.pills.length === 0
        }

        draw(ctx) {
            for (let i = 0; i < this.pills.length; i++) {
                ctx.save();

                ctx.translate(...this.pillPositions[i].dxdy);
                this.pills[i].draw(ctx);

                ctx.restore();
            }
        }

        boundingBox() {
            return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox()
                .translate(this.pillPositions[i])))
        }

        distanceFrom(point) {
            return this.pills.some((pill, i) => {
                const localPoint = point.translate(this.pillPositions[i].invert());
                return pill.contains(localPoint);
            }) ? 0 : Infinity
        }
    }

    const fitTextToCircle = (text, radius, measureWidth, lineHeight) => {

        const sq = (n) => n * n;
        const range = (n) => {
            const array = new Array(n);
            for (let i = 0; i < n; i++) {
                array[i] = i;
            }
            return array;
        };

        const extent = (possibleLines, lineIndex) => {
            const mid = (lineIndex - (possibleLines - 1) / 2) * lineHeight;
            const top = mid - lineHeight / 2;
            const bottom = mid + lineHeight / 2;
            const topWidth = Math.sqrt(sq(radius) - sq(top));
            const bottomWidth = Math.sqrt(sq(radius) - sq(bottom));
            const width = Math.min(topWidth, bottomWidth) * 2;
            return ({
                top,
                mid,
                width
            })
        };

        const maxLines = Math.floor(radius * 2 / lineHeight);

        const linesForStaringPoint = (availableLines, startingLine) => {
            const words = text.split(/\s+/);
            const lines = [];
            let lineIndex = startingLine;
            const newLine = () => ({
                index: lineIndex,
                extent: extent(availableLines, lineIndex)
            });
            let currentLine = newLine();
            const pushCurrentLineUnlessEmpty = () => {
                if (currentLine.hasOwnProperty('text')) {
                    lines.push(currentLine);
                }
            };
            const currentLineWithExtraWord = (word) => {
                if (currentLine.text) {
                    return currentLine.text + ' ' + word;
                } else {
                    return word;
                }
            };

            while (words.length > 0) {
                if (measureWidth(currentLineWithExtraWord(words[0])) > currentLine.extent.width) {
                    pushCurrentLineUnlessEmpty();
                    lineIndex++;
                    if (lineIndex >= availableLines) break;
                    currentLine = newLine();
                } else {
                    currentLine.text = currentLineWithExtraWord(words.shift());
                }
            }
            if (words.length === 0) {
                pushCurrentLineUnlessEmpty();
            }
            return {
                availableLines,
                startingLine,
                lines,
                emptyLinesBelow: availableLines - (lines.length > 0 ? lines[lines.length - 1].index : startingLine) - 1,
                wordsRemaining: words.length
            }
        };

        const possibleLayoutsA = range(Math.ceil(maxLines / 2)).map(startingLine => linesForStaringPoint(maxLines, startingLine));
        const possibleLayoutsB = range(Math.ceil((maxLines - 1) / 2)).map(startingLine => linesForStaringPoint(maxLines - 1, startingLine));
        const allPossibleLayouts = possibleLayoutsA.concat(possibleLayoutsB);

        const filterLowest = (array, accessor) => {
            const min = Math.min(...array.map(accessor));
            return array.filter(item => accessor(item) === min)
        };

        const balancedLayout = (() => {
            const mostWords = filterLowest(allPossibleLayouts, layout => layout.wordsRemaining);
            const fewestLines = filterLowest(mostWords, layout => layout.lines.length);
            const mostBalanced = filterLowest(fewestLines, layout => Math.abs(layout.startingLine - layout.emptyLinesBelow));
            return mostBalanced[0]
        })();

        const spacePerLine = (line) => {
            return line.extent.width - measureWidth(line.text)
        };
        const biggestGap = layout => Math.max(...layout.lines.map(spacePerLine));

        const layoutWithSwappedLines = (layout) => {
            const gappyLines = layout.lines.sort((a, b) => spacePerLine(b) - spacePerLine(a));
            const mostGappy = gappyLines[0];
            const lineAbove = layout.lines.filter(line => line.index === mostGappy.index - 1)[0];
            if (lineAbove) {
                const wordsAbove = lineAbove.text.split(' ');
                const lastWord = wordsAbove[wordsAbove.length - 1];
                const newLineAbove = { ...lineAbove,
                    text: wordsAbove.slice(0, -1).join(' ')
                };
                const newGappyLine = { ...mostGappy,
                    text: lastWord + ' ' + mostGappy.text
                };
                if (spacePerLine(newGappyLine) > 0) {
                    return ({
                        ...layout,
                        lines: layout.lines.map(line => {
                            if (line.index === newLineAbove.index) {
                                return newLineAbove
                            } else if (line.index === newGappyLine.index) {
                                return newGappyLine
                            } else {
                                return line
                            }
                        })
                    })
                }
            }
        };

        const moreLayouts = (() => {
            const layouts = [];
            let currentLayout = balancedLayout;
            while (currentLayout) {
                layouts.push(currentLayout);
                currentLayout = layoutWithSwappedLines(currentLayout);
            }
            return layouts
        })();

        const bestLayout = moreLayouts.slice(0).sort((a, b) => biggestGap(a) - biggestGap(b))[0] ||
            ({
                lines: [],
                wordsRemaining: Infinity
            });

        return {
            top: Math.min(...bestLayout.lines.map(line => line.extent.top)),
            lines: bestLayout.lines.sort((a, b) => a.index - b.index).map(line => line.text),
            allTextFits: bestLayout.wordsRemaining === 0
        }
    };

    class NodeCaptionFillNode {
        constructor(caption, radius, editing, style, textMeasurement) {
            this.caption = caption;
            this.radius = radius;
            this.editing = editing;
            this.font = {
                fontWeight: style('caption-font-weight'),
                fontSize: style('caption-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            this.fontColor = style('caption-color');
            this.orientation = {
                horizontal: 'center',
                vertical: 'center'
            };
            this.lineHeight = this.font.fontSize * 1.2;
            const measureWidth = (string) => textMeasurement.measureText(string).width;
            this.layout = fitTextToCircle(this.caption, Math.max(1, this.radius), measureWidth, this.lineHeight);
        }

        get type() {
            return 'CAPTION'
        }

        draw(ctx) {
            if (this.editing) return

            ctx.save();

            ctx.font = this.font;
            ctx.fillStyle = this.fontColor;
            ctx.textBaseline = 'middle';

            for (let i = 0; i < this.layout.lines.length; i++) {
                const yPos = this.layout.top + (i + 0.5) * this.lineHeight;
                drawTextLine(ctx, this.layout.lines[i], new Point(0, yPos), 'center');
            }

            ctx.restore();
        }

        get contentsFit() {
            return this.layout.allTextFits
        }

        boundingBox() {
            const height = this.layout.lines.length * this.lineHeight;
            return new BoundingBox(-this.radius,
                this.radius,
                this.layout.top,
                this.layout.top + height
            )
        }

        distanceFrom(point) {
            return point.vectorFromOrigin().distance()
        }
    }

    class Icon {
        constructor(imageKey, style, imageCache) {
            this.iconImage = style(imageKey);
            const iconSize = style('icon-size');
            this.imageInfo = getCachedImage(imageCache, this.iconImage);
            if (this.imageInfo.width === 0 || this.imageInfo.height === 0) {
                this.width = this.height = iconSize;
            } else {
                const largestDimension = this.imageInfo.width > this.imageInfo.height ? 'width' : 'height';
                this.width = largestDimension === 'width' ? iconSize : iconSize * this.imageInfo.width / this.imageInfo.height;
                this.height = largestDimension === 'height' ? iconSize : iconSize * this.imageInfo.height / this.imageInfo.width;
            }
        }

        draw(ctx, x, y) {
            if (isImageInfoLoaded(this.imageInfo)) {
                ctx.image(this.imageInfo, x, y, this.width, this.height);
            }
        }
    }

    class NodeIconInside {
        constructor(imageKey, editing, style, imageCache) {
            this.editing = editing;
            this.orientation = {
                horizontal: 'center',
                vertical: 'center'
            };
            this.icon = new Icon(imageKey, style, imageCache);
            this.width = this.icon.width;
            this.height = this.icon.height;
        }

        get type() {
            return 'ICON'
        }

        draw(ctx) {
            if (this.editing) return

            const x = -this.width / 2;
            const y = 0;
            this.icon.draw(ctx, x, y);
        }

        get contentsFit() {
            return true
        }

        boundingBox() {
            return new BoundingBox(-this.width / 2,
                this.width / 2,
                0,
                this.height
            )
        }

        distanceFrom(point) {
            return point.vectorFromOrigin().distance()
        }
    }

    class IconOutside {
        constructor(imageKey, orientation, editing, style, imageCache) {
            this.orientation = orientation;
            this.editing = editing;
            this.icon = new Icon(imageKey, style, imageCache);
            this.width = this.icon.width;
            this.height = this.icon.height;
            const horizontalPosition = (() => {
                switch (orientation.horizontal) {
                    case 'start':
                        return 0
                    case 'center':
                        return -this.width / 2
                    case 'end':
                        return -this.width
                }
            })();
            this.boxPosition = new Point(horizontalPosition, 0);
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
        }

        get type() {
            return 'ICON'
        }

        draw(ctx) {
            if (this.editing) return

            this.icon.draw(ctx, this.boxPosition.x, this.boxPosition.y);
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            const boundingBox = this.boundingBox();
            ctx.save();
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = indicatorWidth;
            ctx.lineJoin = 'round';
            ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true);
            ctx.restore();
        }

        get contentsFit() {
            return true
        }

        boundingBox() {
            const left = this.boxPosition.x;
            const top = this.boxPosition.y;

            return new BoundingBox(left, left + this.width, top, top + this.height)
        }

        distanceFrom(point) {
            return this.boundingBox().contains(point) ? 0 : Infinity
        }
    }

    const distribute = (preferredAngles, obstacles) => {
        return preferredAngles.map(angle => {
            return {
                angle,
                separation: obstacleSeparation(angle, obstacles)
            }
        }).sort((a, b) => b.separation - a.separation)[0].angle;
    };

    const obstacleSeparation = (angle, obstacles) => {
        return Math.min(...obstacles.map(obstacle => Math.min(
            Math.abs(obstacle.angle - angle),
            Math.abs(obstacle.angle - (angle - Math.PI * 2)),
            Math.abs(obstacle.angle - (angle + Math.PI * 2))
        )))
    };

    const orientations = [{
            name: 'top-left',
            angle: -3 * Math.PI / 4,
            vertical: 'top',
            horizontal: 'end'
        },
        {
            name: 'top',
            angle: -Math.PI / 2,
            vertical: 'top',
            horizontal: 'center'
        },
        {
            name: 'top-right',
            angle: -Math.PI / 4,
            vertical: 'top',
            horizontal: 'start'
        },
        {
            name: 'right',
            angle: 0,
            vertical: 'center',
            horizontal: 'start'
        },
        {
            name: 'bottom-right',
            angle: Math.PI / 4,
            vertical: 'bottom',
            horizontal: 'start'
        },
        {
            name: 'bottom',
            angle: Math.PI / 2,
            vertical: 'bottom',
            horizontal: 'center'
        },
        {
            name: 'bottom-left',
            angle: 3 * Math.PI / 4,
            vertical: 'bottom',
            horizontal: 'end'
        },
        {
            name: 'left',
            angle: Math.PI,
            vertical: 'center',
            horizontal: 'end'
        },
    ];

    const orientationAngles = orientations.map(orientation => orientation.angle);

    const orientationFromName = (name) => {
        return orientations.find(orientation => orientation.name === name) || orientations[0]
    };

    const orientationFromAngle = (angle) => {
        return orientations.find(orientation => orientation.angle === angle) || orientations[0]
    };

    class ComponentStack {
        constructor() {
            this.offsetComponents = [];
        }

        push(component) {
            let top = 0;
            if (!this.isEmpty()) {
                const above = this.bottomComponent();
                const safeMargin = (component) => component.margin || 0;
                const margin = Math.max(safeMargin(above.component), safeMargin(component));
                top = above.top + above.component.height + margin;
            }
            this.offsetComponents.push({
                component,
                top
            });
        }

        isEmpty(filter) {
            return (filter ? this.offsetComponents.filter(filter) : this.offsetComponents).length === 0
        }

        bottomComponent() {
            return this.offsetComponents[this.offsetComponents.length - 1]
        }

        totalHeight() {
            if (this.isEmpty()) {
                return 0
            }
            const bottomComponent = this.bottomComponent();
            return bottomComponent.top + bottomComponent.component.height
        }

        maxWidth() {
            return Math.max(...this.offsetComponents.map(offsetComponent => offsetComponent.component.width))
        }

        maxRadius(verticalOffset) {
            return this.offsetComponents.reduce((largest, offsetComponent) => {
                const component = offsetComponent.component;
                const topCorner = new Vector(component.width / 2, verticalOffset);
                const bottomCorner = new Vector(component.width / 2, verticalOffset + component.height);
                return Math.max(largest, topCorner.distance(), bottomCorner.distance())
            }, 0)
        }

        everythingFits(verticalOffset, radius) {
            return this.maxRadius(verticalOffset) <= radius
        }

        scaleToFit(verticalOffset, radius) {
            const effectiveRadius = this.maxRadius(verticalOffset);
            return radius / effectiveRadius
        }

        boundingBox() {
            return combineBoundingBoxes(this.offsetComponents.map(offsetComponent =>
                offsetComponent.component.boundingBox()
                .translate(new Vector(0, offsetComponent.top))))
        }

        distanceFrom(point) {
            return Math.min(...this.offsetComponents.map(offsetComponent => {
                const localPoint = point.translate(new Vector(0, -offsetComponent.top));
                return offsetComponent.component.distanceFrom(localPoint)
            }))
        }

        draw(ctx) {
            this.offsetComponents.forEach(offsetComponent => {
                ctx.save();
                ctx.translate(0, offsetComponent.top);

                offsetComponent.component.draw(ctx);

                ctx.restore();
            });
        }

        drawSelectionIndicator(ctx) {
            this.offsetComponents.forEach(offsetComponent => {
                ctx.save();
                ctx.translate(0, offsetComponent.top);

                offsetComponent.component.drawSelectionIndicator(ctx);

                ctx.restore();
            });
        }
    }

    class VisualNode {
        constructor(node, graph, selected, editing, measureTextContext, imageCache) {
            this.node = node;
            this.selected = selected;
            this.editing = editing;
            // 获取style属性
            const style = styleAttribute => getStyleSelector(node, styleAttribute, graph);

            this.internalRadius = style('radius');
            this.radius = this.internalRadius + style('border-width');
            this.outsideComponentRadius = this.radius + style('node-margin');
            this.fitRadius = this.internalRadius - style('node-padding');
            // 节点的背景色
            this.background = new NodeBackground(node.position, this.internalRadius, editing, style, imageCache);
            // todo ？？？
            const neighbourObstacles = neighbourPositions(node, graph).map(position => {
                return {
                    angle: position.vectorFrom(node.position).angle()
                }
            });

            this.internalVerticalOffset = 0;
            this.internalScaleFactor = undefined;
            this.insideComponents = new ComponentStack();
            this.outsideComponents = new ComponentStack();

            const captionPosition = style('caption-position');
            const labelPosition = style('label-position');
            const propertyPosition = style('property-position');
            const iconImage = style('node-icon-image');
            const iconPosition = style('icon-position');
            const hasIcon = !!iconImage;
            const hasCaption = !!node.caption;
            const hasLabels = node.labels.length > 0;
            const hasProperties = Object.keys(node.properties).length > 0;

            const outsidePosition = style('outside-position');
            switch (outsidePosition) {
                case 'auto':
                    this.outsideOrientation = orientationFromAngle(distribute(orientationAngles, neighbourObstacles));
                    break

                default:
                    this.outsideOrientation = orientationFromName(outsidePosition);
            }

            if (hasIcon) {
                switch (iconPosition) {
                    case 'inside':
                        this.insideComponents.push(this.icon = new NodeIconInside('node-icon-image', editing, style, imageCache));
                        break;
                    default:
                        this.outsideComponents.push(this.icon = new IconOutside('node-icon-image', this.outsideOrientation, editing, style, imageCache));
                }
            }

            const caption = node.caption || '';
            if (hasCaption) {
                switch (captionPosition) {
                    case 'inside':
                        if ((hasLabels && labelPosition === 'inside') ||
                            (hasProperties && propertyPosition === 'inside') ||
                            (hasIcon && iconPosition === 'inside')) {
                            this.insideComponents.push(this.caption =
                                new NodeCaptionInsideNode(caption, editing, style, measureTextContext));
                        } else {
                            this.internalScaleFactor = bisect((factor) => {
                                this.caption = new NodeCaptionFillNode(caption, this.fitRadius / factor, editing, style, measureTextContext);
                                return this.caption.contentsFit
                            }, 1, 1e-6);
                            this.insideComponents.push(this.caption);
                        }
                        break
                    default:
                        this.outsideComponents.push(this.caption = new NodeCaptionOutsideNode(
                            caption, this.outsideOrientation, editing, style, measureTextContext));
                        break
                }
            }

            if (hasLabels) {
                switch (labelPosition) {
                    case 'inside':
                        this.insideComponents.push(this.labels = new NodeLabelsInsideNode(
                            node.labels, editing, style, measureTextContext));
                        break

                    default:
                        this.outsideComponents.push(this.labels = new NodeLabelsOutsideNode(
                            node.labels, this.outsideOrientation, editing, style, measureTextContext));
                }
            }

            if (hasProperties) {
                switch (propertyPosition) {
                    case 'inside':
                        this.insideComponents.push(this.properties = new NodePropertiesInside(
                            node.properties, editing, style, measureTextContext));
                        break

                    default:
                        this.outsideComponents.push(this.properties = new PropertiesOutside(
                            node.properties, this.outsideOrientation, editing, style, measureTextContext));
                }
            }

            if (this.internalScaleFactor === undefined) {
                this.internalVerticalOffset = -this.insideComponents.totalHeight() / 2;
                this.internalScaleFactor = this.insideComponents.everythingFits(this.internalVerticalOffset, this.fitRadius) ?
                    1 : this.insideComponents.scaleToFit(this.internalVerticalOffset, this.fitRadius);
            }

            const outsideVerticalOffset = (() => {
                const height = this.outsideComponents.totalHeight();
                switch (this.outsideOrientation.vertical) {
                    case 'top':
                        return -height
                    case 'center':
                        return -height / 2
                    case 'bottom':
                        return 0
                }
            })();
            this.outsideOffset = new Vector(1, 0)
                .rotate(this.outsideOrientation.angle)
                .scale(this.outsideComponentRadius)
                .plus(new Vector(0, outsideVerticalOffset));
        }

        get id() {
            return this.node.id
        }

        get position() {
            return this.node.position
        }

        get status() {
            return this.node.status
        }

        get superNodeId() {
            return this.node.superNodeId
        }

        get type() {
            return this.node.type
        }

        get initialPositions() {
            return this.node.initialPositions
        }

        draw(ctx) {
            if (this.status === 'combined') {
                return
            }

            ctx.save('node');

            if (this.selected) {
                this.background.drawSelectionIndicator(ctx);

                ctx.save();
                ctx.translate(...this.position.xy);
                ctx.translate(...this.outsideOffset.dxdy);

                this.outsideComponents.drawSelectionIndicator(ctx);

                ctx.restore();
            }

            this.background.draw(ctx);

            ctx.save();
            ctx.translate(...this.position.xy);

            ctx.save();
            ctx.scale(this.internalScaleFactor);
            ctx.translate(0, this.internalVerticalOffset);

            this.insideComponents.draw(ctx);

            ctx.restore();

            ctx.save();
            ctx.translate(...this.outsideOffset.dxdy);

            this.outsideComponents.draw(ctx);

            ctx.restore();

            ctx.restore();
            ctx.restore();
        }

        boundingBox() {
            let box = new BoundingBox(
                this.position.x - this.radius,
                this.position.x + this.radius,
                this.position.y - this.radius,
                this.position.y + this.radius
            );

            if (this.outsideComponents.isEmpty()) {
                return box
            }

            return box.combine(this.outsideComponents.boundingBox()
                .translate(this.position.vectorFromOrigin())
                .translate(this.outsideOffset))
        }

        distanceFrom(point) {
            const localPoint = point.translate(this.position.vectorFromOrigin().invert());
            const outsidePoint = localPoint.translate(this.outsideOffset.invert());
            return Math.min(
                this.position.vectorFrom(point).distance(),
                this.outsideComponents.distanceFrom(outsidePoint)
            )
        }
    }

    const attachmentOptions = [{
            name: 'top',
            angle: -Math.PI / 2
        },
        {
            name: 'right',
            angle: 0
        },
        {
            name: 'bottom',
            angle: Math.PI / 2
        },
        {
            name: 'left',
            angle: Math.PI
        }
    ];

    const relationshipArrowDimensions = (resolvedRelationship, graph, leftNode) => {
        const style = styleKey => getStyleSelector(resolvedRelationship.relationship, styleKey, graph);
        const startRadius = resolvedRelationship.from.radius + style('margin-start');
        const endRadius = resolvedRelationship.to.radius + style('margin-end');
        const arrowWidth = style('arrow-width');
        const arrowColor = style('arrow-color');
        const selectionColor = adaptForBackground(selectionBorder, style);

        let hasArrowHead = false;
        let headWidth = 0;
        let headHeight = 0;
        let chinHeight = 0;

        const directionality = style('directionality');
        if (directionality === 'directed') {
            hasArrowHead = true;
            headWidth = arrowWidth + 6 * Math.sqrt(arrowWidth);
            headHeight = headWidth * 1.5;
            chinHeight = headHeight / 10;
        }

        const separation = style('margin-peer');
        const leftToRight = resolvedRelationship.from === leftNode;

        return {
            startRadius,
            endRadius,
            arrowWidth,
            arrowColor,
            selectionColor,
            hasArrowHead,
            headWidth,
            headHeight,
            chinHeight,
            separation,
            leftToRight
        }
    };

    class ResolvedRelationship {
        constructor(relationship, from, to, startAttachment, endAttachment, selected) {
            this.relationship = relationship;
            this.id = relationship.id;
            this.from = from;
            this.to = to;
            this.startAttachment = startAttachment;
            this.endAttachment = endAttachment;
            this.type = relationship.type;
            this.selected = selected;
        }
    }

    // creates a polygon for an arrow head facing right, with its point at the origin.
    function arrowHead(ctx, headHeight, chinHeight, headWidth, fill, stroke) {
        ctx.polygon([{
                x: chinHeight - headHeight,
                y: 0
            },
            {
                x: -headHeight,
                y: headWidth / 2
            },
            {
                x: 0,
                y: 0
            },
            {
                x: -headHeight,
                y: -headWidth / 2
            }
        ], fill, stroke);
    }

    const perpendicular = (angle) => {
        return normaliseAngle(angle + Math.PI / 2)
    };

    const normaliseAngle = (angle) => {
        let goodAngle = angle;
        while (goodAngle < -Math.PI) goodAngle += 2 * Math.PI;
        while (goodAngle > Math.PI) goodAngle -= 2 * Math.PI;
        return goodAngle
    };

    const getDistanceToLine = (x1, y1, x2, y2, x3, y3) => {
        let px = x2 - x1;
        let py = y2 - y1;
        let something = px * px + py * py;
        let u = ((x3 - x1) * px + (y3 - y1) * py) / something;

        if (u > 1) {
            u = 1;
        } else if (u < 0) {
            u = 0;
        }

        let x = x1 + u * px;
        let y = y1 + u * py;
        let dx = x - x3;
        let dy = y - y3;

        // # Note: If the actual distance does not matter,
        // # if you only want to compare what this function
        // # returns to other results of this function, you
        // # can just return the squared distance instead
        // # (i.e. remove the sqrt) to gain a little performance

        return Math.sqrt(dx * dx + dy * dy)
    };

    class SeekAndDestroy {
        constructor(start, startDirection, end, endDirection) {
            this.waypoints = [];
            this.start = start;
            this.position = start;
            this.startDirection = startDirection;
            this.direction = startDirection;
            this.end = end;
            this.endDirection = endDirection;
        }

        forwardToWaypoint(distance, turn, radius) {
            this.position = this.position.translate(new Vector(distance, 0).rotate(this.direction));
            this.direction = normaliseAngle(this.direction + turn);
            this.waypoints.push({
                point: this.position,
                distance,
                turn,
                radius
            });
        }

        get endRelative() {
            return this.end.translate(this.position.vectorFromOrigin().invert()).rotate(-this.direction)
        }

        get endDirectionRelative() {
            return normaliseAngle(this.endDirection - this.direction)
        }

        get rightAngleTowardsEnd() {
            return this.endRelative.y < 0 ? -Math.PI / 2 : Math.PI / 2
        }

        segment(i) {
            const from = i === 0 ? this.start : this.waypoints[i - 1].point;
            const to = i < this.waypoints.length ? this.waypoints[i].point : this.end;
            return {
                from,
                to
            }
        }

        nextPoint(i) {
            if (i + 1 < this.waypoints.length) {
                const waypoint = this.waypoints[i];
                const nextWaypoint = this.waypoints[i + 1].point;
                const nextVector = nextWaypoint.vectorFrom(waypoint.point);
                return waypoint.point.translate(nextVector.scale(0.5))
            }
            return this.end
        }

        get polarity() {
            if (this.waypoints.length === 0) {
                return 0
            }
            return Math.sign(this.waypoints[0].turn)
        }

        changeEnd(newEnd) {
            const path = new SeekAndDestroy(this.start, this.startDirection, newEnd, this.endDirection);
            path.waypoints = this.waypoints;
            return path
        }

        inverse() {
            const path = new SeekAndDestroy(
                this.end,
                normaliseAngle(this.endDirection + Math.PI),
                this.start,
                normaliseAngle(this.startDirection + Math.PI)
            );
            for (let i = this.waypoints.length - 1; i >= 0; i--) {
                const waypoint = this.waypoints[i];
                path.forwardToWaypoint(
                    waypoint.point.vectorFrom(path.position).distance(), -waypoint.turn,
                    waypoint.radius
                );
            }
            return path
        }

        draw(ctx) {
            ctx.moveTo(...this.start.xy);
            let previous = this.start;
            for (let i = 0; i < this.waypoints.length; i++) {
                const waypoint = this.waypoints[i];
                const next = this.nextPoint(i);
                let control = waypoint.point;
                const vector1 = previous.vectorFrom(control);
                const vector2 = next.vectorFrom(control);
                const d = waypoint.radius * Math.tan(Math.abs(waypoint.turn) / 2);
                if (vector1.distance() < d) {
                    const overlap = d - vector1.distance();
                    control = control.translate(vector2.scale(overlap / vector2.distance()));
                }
                if (vector2.distance() < d) {
                    const overlap = d - vector2.distance();
                    control = control.translate(vector1.scale(overlap / vector1.distance()));
                }

                ctx.arcTo(...control.xy, ...next.xy, waypoint.radius);
                previous = next;
            }
            ctx.lineTo(...this.end.xy);
        }

        distanceFrom(point) {
            let minDistance = Infinity;
            for (let i = 0; i < this.waypoints.length + 1; i++) {
                const segment = this.segment(i);
                const distance = getDistanceToLine(...segment.from.xy, ...segment.to.xy, ...point.xy);
                minDistance = Math.min(distance, minDistance);
            }
            return minDistance
        }
    }

    const compareWaypoints = (a, b) => {
        if (a.length === 0 && b.length === 0) return 0

        if (a.length === 0) {
            return -Math.sign(b[0].turn)
        }

        if (b.length === 0) {
            return Math.sign(a[0].turn)
        }

        const aFirstWaypoint = a[0];
        const bFirstWaypoint = b[0];

        if (aFirstWaypoint.turn !== bFirstWaypoint.turn) {
            return Math.sign(aFirstWaypoint.turn - bFirstWaypoint.turn)
        }

        if (Math.abs(aFirstWaypoint.distance - bFirstWaypoint.distance) > 0.0001) {
            return Math.sin(a[0].turn) * Math.sign(bFirstWaypoint.distance - aFirstWaypoint.distance)
        }

        return compareWaypoints(a.slice(1), b.slice(1))
    };

    class RectilinearArrow {
        constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
            this.dimensions = dimensions;
            const arcRadius = startAttachment.total > endAttachment.total ? computeArcRadius(startAttachment) : computeArcRadius(endAttachment);
            const startAttachAngle = startAttachment.attachment.angle;
            const endAttachAngle = endAttachment.attachment.angle;
            const startOffset = (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10;
            const endOffset = (endAttachment.ordinal - (endAttachment.total - 1) / 2) * 10;
            const endShaftRadius = endRadius + this.dimensions.headHeight - this.dimensions.chinHeight;
            const startAttach = startCentre.translate(new Vector(startRadius, startOffset).rotate(startAttachAngle));
            const endAttach = endCentre.translate(new Vector(endRadius, endOffset).rotate(endAttachAngle));
            this.endShaft = endCentre.translate(new Vector(endShaftRadius, endOffset).rotate(endAttachAngle));
            const startNormalDistance = arcRadius + startAttachment.minNormalDistance;
            const endNormalDistance = arcRadius + endAttachment.minNormalDistance - (this.dimensions.headHeight - this.dimensions.chinHeight);

            const fanOut = startAttachment.total > endAttachment.total;

            this.shaft = new SeekAndDestroy(startAttach, startAttachAngle, this.endShaft, normaliseAngle(endAttachAngle + Math.PI));
            let longestSegmentIndex;

            const initialAngle = Math.abs(Math.round(this.shaft.endDirectionRelative * 180 / Math.PI));
            switch (initialAngle) {
                case 0:
                    if (this.shaft.endRelative.x > 0) {
                        if (this.shaft.endRelative.y === 0) {
                            longestSegmentIndex = 0;
                        } else {
                            const distance = this.shaft.endRelative.x < arcRadius * 2 ? this.shaft.endRelative.x / 2 :
                                (fanOut ? startNormalDistance : this.shaft.endRelative.x - endNormalDistance);
                            this.shaft.forwardToWaypoint(distance, this.shaft.rightAngleTowardsEnd, arcRadius);
                            this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);

                            longestSegmentIndex = fanOut ? 2 : 0;
                        }
                    } else {
                        this.shaft.forwardToWaypoint(startNormalDistance, this.shaft.rightAngleTowardsEnd, arcRadius);
                        const distance = Math.max(startNormalDistance + startRadius, this.shaft.endRelative.x + endRadius + arcRadius);
                        this.shaft.forwardToWaypoint(distance, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x + endNormalDistance, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);

                        longestSegmentIndex = 2;
                    }
                    break

                case 90:
                    if (this.shaft.endRelative.x > 0) {
                        if (this.shaft.endDirectionRelative * this.shaft.endRelative.y < 0) {
                            this.shaft.forwardToWaypoint(this.shaft.endRelative.x - endRadius - arcRadius, this.shaft.rightAngleTowardsEnd, arcRadius);
                            this.shaft.forwardToWaypoint(this.shaft.endRelative.x + arcRadius, this.shaft.rightAngleTowardsEnd, arcRadius);
                        }
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);
                        longestSegmentIndex = 0;
                    } else {
                        longestSegmentIndex = Math.abs(this.shaft.endRelative.x) > Math.abs(this.shaft.endRelative.y) ? 1 : 2;

                        this.shaft.forwardToWaypoint(Math.max(startNormalDistance, arcRadius * 2 + this.shaft.endRelative.x), this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(Math.max(this.shaft.endRelative.x + arcRadius, arcRadius * 2), this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);
                    }
                    break

                default:
                    if (Math.abs(this.shaft.endRelative.y) > arcRadius * 2) {
                        const distance = Math.max(arcRadius, this.shaft.endRelative.x + arcRadius);
                        this.shaft.forwardToWaypoint(distance, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);

                        longestSegmentIndex = 1;
                    } else {
                        this.shaft.forwardToWaypoint(arcRadius, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(arcRadius + startRadius, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x - arcRadius, this.shaft.rightAngleTowardsEnd, arcRadius);
                        this.shaft.forwardToWaypoint(this.shaft.endRelative.x, this.shaft.rightAngleTowardsEnd, arcRadius);

                        longestSegmentIndex = 3;
                    }
            }

            this.path = this.shaft.changeEnd(endAttach);

            const longestSegment = this.shaft.segment(longestSegmentIndex);
            this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5));
            this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle();
        }

        distanceFrom(point) {
            return this.path.distanceFrom(point)
        }

        draw(ctx) {
            ctx.save();
            ctx.beginPath();
            this.shaft.draw(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth;
            ctx.strokeStyle = this.dimensions.arrowColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(...this.endShaft.xy);
                ctx.rotate(this.shaft.endDirection);
                ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
                ctx.fillStyle = this.dimensions.arrowColor;
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false);
                ctx.fill();
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.beginPath();
            this.shaft.draw(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.dimensions.selectionColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(...this.endShaft.xy);
                ctx.rotate(this.shaft.endDirection);
                ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
                ctx.lineWidth = indicatorWidth;
                ctx.lineJoin = 'round';
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true);
                ctx.stroke();
            }
            ctx.restore();
        }

        midPoint() {
            return this.midShaft
        }

        shaftAngle() {
            return this.midShaftAngle
        }

        get arrowKind() {
            return 'straight'
        }
    }

    const computeArcRadius = (attachment) => {
        return 40 + attachment.radiusOrdinal * 10
    };

    class ElbowArrow {
        constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
            this.dimensions = dimensions;
            const fixedEnd = (startAttachment && startAttachment.attachment.name !== 'normal') ? 'start' : 'end';
            const fixedAttachment = fixedEnd === 'start' ? startAttachment : endAttachment;
            const arcRadius = 40 + fixedAttachment.radiusOrdinal * 10;
            const fixedCentre = fixedEnd === 'start' ? startCentre : endCentre;
            const normalCentre = fixedEnd === 'end' ? startCentre : endCentre;
            const fixedRadius = fixedEnd === 'start' ? startRadius : endRadius + dimensions.headHeight - dimensions.chinHeight;
            const fixedDivergeRadius = fixedEnd === 'start' ? startRadius + startAttachment.minNormalDistance : endRadius + Math.max(endAttachment.minNormalDistance, dimensions.headHeight - dimensions.chinHeight);
            const normalRadius = fixedEnd === 'end' ? startRadius : endRadius + dimensions.headHeight - dimensions.chinHeight;
            const fixedAttachAngle = fixedAttachment.attachment.angle;
            const offset = (fixedAttachment.ordinal - (fixedAttachment.total - 1) / 2) * 10;
            const fixedAttach = fixedCentre.translate(new Vector(fixedRadius, offset).rotate(fixedAttachAngle));
            const fixedDiverge = fixedCentre.translate(new Vector(fixedDivergeRadius, offset).rotate(fixedAttachAngle));
            const normalCentreRelative = normalCentre.translate(fixedDiverge.vectorFromOrigin().invert()).rotate(-fixedAttachAngle);
            const arcCentre = new Point(0, normalCentreRelative.y < 0 ? -arcRadius : arcRadius);
            const arcCentreVector = normalCentreRelative.vectorFrom(arcCentre);
            const gamma = Math.asin(arcRadius / arcCentreVector.distance());
            const theta = gamma + Math.abs(arcCentreVector.angle());
            const d = arcRadius * Math.tan(theta / 2);
            const control = fixedAttach.translate(new Vector(d, 0).rotate(fixedAttachAngle));
            const normalAttachAngle = control.vectorFrom(normalCentre).angle();
            const normalAttach = normalCentre.translate(new Vector(normalRadius, 0).rotate(normalAttachAngle));

            const path = new SeekAndDestroy(fixedAttach, fixedAttachAngle, normalAttach, normaliseAngle(normalAttachAngle + Math.PI));
            path.forwardToWaypoint(d + fixedDivergeRadius - fixedRadius, Math.sign(path.endDirectionRelative) * theta, arcRadius);

            const longestSegment = path.segment(1);
            this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5));
            this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle();
            if (fixedEnd === 'start') {
                this.midShaftAngle = normaliseAngle(this.midShaftAngle + Math.PI);
            }

            this.path = fixedEnd === 'start' ? path : path.inverse();
        }

        distanceFrom(point) {
            return this.path.distanceFrom(point)
        }

        draw(ctx) {
            ctx.save();
            ctx.beginPath();
            this.path.draw(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth;
            ctx.strokeStyle = this.dimensions.arrowColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(...this.path.end.xy);
                ctx.rotate(this.path.endDirection);
                ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
                ctx.fillStyle = this.dimensions.arrowColor;
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false);
                ctx.fill();
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.beginPath();
            this.path.draw(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.dimensions.selectionColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(...this.path.end.xy);
                ctx.rotate(this.path.endDirection);
                ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
                ctx.lineWidth = indicatorWidth;
                ctx.lineJoin = 'round';
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true);
                ctx.stroke();
            }
            ctx.restore();
        }

        midPoint() {
            return this.midShaft
        }

        shaftAngle() {
            return this.midShaftAngle
        }

        get arrowKind() {
            return 'straight'
        }
    }

    const computeRelationshipAttachments = (graph, visualNodes) => {
        const nodeAttachments = {};
        const countAttachment = (nodeId, attachmentOptionName) => {
            const nodeCounters = nodeAttachments[nodeId] || (nodeAttachments[nodeId] = {});
            nodeCounters[attachmentOptionName] = (nodeCounters[attachmentOptionName] || 0) + 1;
        };

        graph.relationships.forEach(relationship => {
            const style = styleAttribute => getStyleSelector(relationship, styleAttribute, graph);
            countAttachment(relationship.fromId, style('attachment-start'));
            countAttachment(relationship.toId, style('attachment-end'));
        });

        const centralAttachment = (nodeId, attachmentOptionName) => {
            const total = nodeAttachments[nodeId][attachmentOptionName];
            return {
                attachment: findOption(attachmentOptionName),
                ordinal: (total - 1) / 2,
                radiusOrdinal: 0,
                minNormalDistance: 0,
                total
            }
        };

        const routedRelationships = graph.relationships.map(relationship => {
            const style = styleAttribute => getStyleSelector(relationship, styleAttribute, graph);
            const startAttachment = centralAttachment(relationship.fromId, style('attachment-start'));
            const endAttachment = centralAttachment(relationship.toId, style('attachment-end'));

            const resolvedRelationship = new ResolvedRelationship(
                relationship,
                visualNodes[relationship.fromId],
                visualNodes[relationship.toId],
                startAttachment,
                endAttachment,
                false,
                graph
            );

            let arrow;
            
            if (startAttachment.attachment.name !== 'normal' || endAttachment.attachment.name !== 'normal') {
                if (startAttachment.attachment.name !== 'normal' && endAttachment.attachment.name !== 'normal') {
                    const dimensions = relationshipArrowDimensions(resolvedRelationship, graph, resolvedRelationship.from);
                    arrow = new RectilinearArrow(
                        resolvedRelationship.from.position,
                        resolvedRelationship.to.position,
                        dimensions.startRadius,
                        dimensions.endRadius,
                        resolvedRelationship.startAttachment,
                        resolvedRelationship.endAttachment,
                        dimensions
                    );
                } else {
                    const dimensions = relationshipArrowDimensions(resolvedRelationship, graph, resolvedRelationship.from);
                    arrow = new ElbowArrow(
                        resolvedRelationship.from.position,
                        resolvedRelationship.to.position,
                        dimensions.startRadius,
                        dimensions.endRadius,
                        resolvedRelationship.startAttachment,
                        resolvedRelationship.endAttachment,
                        dimensions
                    );
                }
            }
            return {
                resolvedRelationship,
                arrow
            }
        });

        const relationshipAttachments = {
            start: {},
            end: {}
        };
        graph.nodes.forEach(node => {
            const relationships = routedRelationships
                .filter(routedRelationship =>
                    node.id === routedRelationship.resolvedRelationship.from.id ||
                    node.id === routedRelationship.resolvedRelationship.to.id);

            attachmentOptions.forEach(option => {
                const relevantRelationships = relationships.filter(routedRelationship => {
                    const startAttachment = routedRelationship.resolvedRelationship.startAttachment;
                    const endAttachment = routedRelationship.resolvedRelationship.endAttachment;
                    return (startAttachment.attachment === option && node.id === routedRelationship.resolvedRelationship.from.id) ||
                        (endAttachment.attachment === option && node.id === routedRelationship.resolvedRelationship.to.id)
                });

                const neighbours = relevantRelationships.map(routedRelationship => {
                    const direction = (
                        routedRelationship.resolvedRelationship.from.id === node.id &&
                        routedRelationship.resolvedRelationship.startAttachment.attachment === option
                    ) ? 'start' : 'end';
                    let path, headSpace = 0;
                    if (routedRelationship.arrow) {
                        if (direction === 'end') {
                            const dimensions = routedRelationship.arrow.dimensions;
                            headSpace = dimensions.headHeight - dimensions.chinHeight;
                        }
                        if (routedRelationship.arrow.path && routedRelationship.arrow.path.waypoints) {
                            if (direction === 'start') {
                                path = routedRelationship.arrow.path;
                            } else {
                                path = routedRelationship.arrow.path.inverse();
                            }
                        }
                    }

                    return {
                        relationship: routedRelationship.resolvedRelationship.relationship,
                        direction,
                        path,
                        headSpace
                    }
                });

                const maxHeadSpace = Math.max(...neighbours.map(neighbour => neighbour.headSpace));

                neighbours.sort((a, b) => {
                    return (a.path && b.path) ? compareWaypoints(a.path.waypoints, b.path.waypoints) : 0
                });
                
                neighbours.forEach((neighbour, i) => {
                    relationshipAttachments[neighbour.direction][neighbour.relationship.id] = {
                        attachment: option,
                        ordinal: i,
                        radiusOrdinal: computeRadiusOrdinal(neighbour.path, i, neighbours.length),
                        minNormalDistance: maxHeadSpace,
                        total: neighbours.length
                    };
                });
            });
        });

        return relationshipAttachments
    };

    const findOption = (optionName) => {
        return attachmentOptions.find(option => option.name === optionName) || {
            name: 'normal'
        }
    };

    const computeRadiusOrdinal = (path, ordinal, total) => {
        if (path) {
            const polarity = path.polarity;

            switch (polarity) {
                case -1:
                    return ordinal

                case 1:
                    return total - ordinal - 1

                default:
                    return Math.max(ordinal, total - ordinal - 1)
            }
        }
        return 0
    };

    class ParallelArrow {
        constructor(startCentre, endCentre, startRadius, endRadius, startDeflection, endDeflection, displacement, arcRadius, dimensions) {
            const interNodeVector = endCentre.vectorFrom(startCentre);
            this.centreDistance = interNodeVector.distance();

            this.displacement = displacement;
            this.startCentre = startCentre;
            this.endCentre = endCentre;
            this.startRadius = startRadius;
            this.endRadius = endRadius;
            this.angle = interNodeVector.angle();
            this.midShaft = this.centreDistance / 2;
            this.arcRadius = arcRadius;
            this.dimensions = dimensions;

            this.startAttach = new Point(startRadius, 0).rotate(startDeflection);
            this.endDeflection = endDeflection;
            this.endAttach = new Point(-endRadius, 0).rotate(-endDeflection)
                .translate(new Vector(this.centreDistance, 0));

            this.startControl = this.startAttach.x * displacement / this.startAttach.y;
            this.endControl = this.centreDistance - (this.centreDistance - this.endAttach.x) * displacement / this.endAttach.y;
            this.endShaft = new Point(-(endRadius + dimensions.headHeight - dimensions.chinHeight), 0).rotate(-endDeflection)
                .translate(new Vector(this.centreDistance, 0));

            const endArcHeight = arcRadius - arcRadius * Math.cos(Math.abs(endDeflection));
            this.drawArcs =
                this.midShaft - this.startControl > this.arcRadius * Math.tan(Math.abs(startDeflection) / 2) &&
                this.endControl - this.midShaft > this.arcRadius * Math.tan(Math.abs(endDeflection) / 2) &&
                (displacement < 0 ? this.endShaft.y - endArcHeight > displacement : this.endShaft.y + endArcHeight < displacement);
        }

        distanceFrom(point) {
            const [startPoint, endPoint] = (this.drawArcs ? [new Point(this.startControl, this.displacement), new Point(this.endControl, this.displacement)] : [this.startAttach, this.endAttach])
            .map(point => point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin()));
            return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.startCentre.x, this.startCentre.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            this.path(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth;
            ctx.strokeStyle = this.dimensions.arrowColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(this.centreDistance, 0);
                ctx.rotate(-this.endDeflection);
                ctx.translate(-this.endRadius, 0);
                ctx.fillStyle = this.dimensions.arrowColor;
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false);
                ctx.fill();
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.translate(this.startCentre.x, this.startCentre.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            this.path(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.dimensions.selectionColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(this.centreDistance, 0);
                ctx.rotate(-this.endDeflection);
                ctx.translate(-this.endRadius, 0);
                ctx.lineWidth = indicatorWidth;
                ctx.lineJoin = 'round';
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true);
                ctx.stroke();
            }
            ctx.restore();
        }

        path(ctx) {
            ctx.moveTo(this.startAttach.x, this.startAttach.y);
            ctx.arcTo(this.startControl, this.displacement, this.midShaft, this.displacement, this.arcRadius);
            ctx.arcTo(this.endControl, this.displacement, this.endShaft.x, this.endShaft.y, this.arcRadius);
            ctx.lineTo(this.endShaft.x, this.endShaft.y);
        }

        midPoint() {
            return new Point((this.centreDistance + this.startRadius - this.endRadius) / 2, this.displacement).rotate(this.angle).translate(this.startCentre.vectorFromOrigin())
        }

        shaftAngle() {
            return this.angle
        }

        get arrowKind() {
            return 'straight'
        }
    }

    class StraightArrow {
        constructor(startCentre, endCentre, startAttach, endAttach, dimensions) {
            const interNodeVector = endCentre.vectorFrom(startCentre);
            const arrowVector = endAttach.vectorFrom(startAttach);
            const factor = (arrowVector.distance() - dimensions.headHeight + dimensions.chinHeight) / arrowVector.distance();

            this.startCentre = startCentre;
            this.angle = interNodeVector.angle();
            this.dimensions = dimensions;
            this.startAttach = startAttach;
            this.endAttach = endAttach;
            this.endShaft = startAttach.translate(arrowVector.scale(factor));
        }

        distanceFrom(point) {
            const [startPoint, endPoint] = [this.startAttach, this.endAttach]
            .map(point => point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin()));
            return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.startCentre.x, this.startCentre.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            ctx.moveTo(this.startAttach.x, this.startAttach.y);
            ctx.lineTo(this.endShaft.x, this.endShaft.y);
            ctx.lineWidth = this.dimensions.arrowWidth;
            ctx.strokeStyle = this.dimensions.arrowColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(this.endAttach.x, this.endAttach.y);
                ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle());
                ctx.fillStyle = this.dimensions.arrowColor;
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false);
                ctx.fill();
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.translate(this.startCentre.x, this.startCentre.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            ctx.moveTo(this.startAttach.x, this.startAttach.y);
            ctx.lineTo(this.endShaft.x, this.endShaft.y);
            ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.dimensions.selectionColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.translate(this.endAttach.x, this.endAttach.y);
                ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle());
                ctx.lineWidth = indicatorWidth;
                ctx.lineJoin = 'round';
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true);
                ctx.stroke();
            }
            ctx.restore();
        }

        midPoint() {
            return this.startAttach.translate(this.endShaft.vectorFrom(this.startAttach).scale(0.5))
                .rotate(this.angle)
                .translate(this.startCentre.vectorFromOrigin())
        }

        shaftAngle() {
            return normaliseAngle(this.angle + this.endAttach.vectorFrom(this.startAttach).angle())
        }

        get arrowKind() {
            return 'straight'
        }
    }

    const normalStraightArrow = (startCentre, endCentre, startRadius, endRadius, dimensions) => {
        const interNodeVector = endCentre.vectorFrom(startCentre);
        const startAttach = new Point(startRadius, 0);
        const endAttach = new Point(interNodeVector.distance() - endRadius, 0);
        return new StraightArrow(startCentre, endCentre, startAttach, endAttach, dimensions)
    };

    class RelationshipType {
        constructor(text, orientation, editing, style, textMeasurement) {
            this.text = text;
            this.editing = editing;
            this.padding = style('type-padding');
            this.borderWidth = style('type-border-width');
            this.fontColor = style('type-color');
            this.borderColor = style('type-border-color');
            this.backgroundColor = style('type-background-color');
            this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style);
            this.font = {
                fontWeight: 'normal',
                fontSize: style('type-font-size'),
                fontFamily: style('font-family')
            };
            textMeasurement.font = this.font;
            const textWidth = textMeasurement.measureText(text).width;
            this.width = textWidth + (this.padding + this.borderWidth) * 2;
            this.height = this.font.fontSize + (this.padding + this.borderWidth) * 2;
            const horizontalPosition = (() => {
                switch (orientation.horizontal) {
                    case 'start':
                        return 0
                    case 'center':
                        return -this.width / 2
                    case 'end':
                        return -this.width
                }
            })();
            this.boxPosition = new Point(
                horizontalPosition,
                0
            );
        }

        get type() {
            return 'TYPE'
        }

        draw(ctx) {
            if (this.text) {
                ctx.save();
                ctx.translate(...this.boxPosition.xy);
                ctx.fillStyle = this.backgroundColor;
                ctx.strokeStyle = this.borderColor;
                ctx.lineWidth = this.borderWidth;
                ctx.rect(
                    this.borderWidth / 2,
                    this.borderWidth / 2,
                    this.width - this.borderWidth,
                    this.height - this.borderWidth,
                    this.padding,
                    true,
                    this.borderWidth > 0
                );
                if (!this.editing) {
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'left';
                    ctx.font = this.font;
                    ctx.fillStyle = this.fontColor;
                    ctx.fillText(this.text, this.borderWidth + this.padding, this.height / 2);
                }
                ctx.restore();
            }
        }

        drawSelectionIndicator(ctx) {
            if (this.text) {
                const indicatorWidth = 10;
                ctx.save();
                ctx.translate(...this.boxPosition.xy);
                ctx.strokeStyle = this.selectionColor;
                ctx.lineWidth = indicatorWidth;
                ctx.rect(
                    this.borderWidth / 2,
                    this.borderWidth / 2,
                    this.width - this.borderWidth,
                    this.height - this.borderWidth,
                    this.padding,
                    false,
                    true
                );
                ctx.restore();
            }
        }

        boundingBox() {
            const left = this.boxPosition.x;
            const top = this.boxPosition.y;

            return new BoundingBox(left, left + this.width, top, top + this.height)
        }

        distanceFrom(point) {
            return this.boundingBox().contains(point) ? 0 : Infinity
        }
    }

    const readableAngle = (orientation, shaftAngle) => {
        const rawAngle = angleForOrientation(orientation, shaftAngle);
        return (rawAngle >= Math.PI / 2 || rawAngle <= -Math.PI / 2) ? rawAngle + Math.PI : rawAngle
    };

    const angleForOrientation = (orientation, shaftAngle) => {
        switch (orientation) {
            case 'parallel':
                return shaftAngle
            case 'perpendicular':
                return perpendicular(shaftAngle)
            default:
                return 0
        }
    };

    const alignmentForShaftAngle = (orientation, position, shaftAngle) => {
        if (position === 'inline') {
            return {
                horizontal: 'center',
                vertical: 'center'
            }
        }

        const isAbove = position === 'above';
        const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle;
        const isUpward = positiveAngle < Math.PI / 2;
        const tolerance = Math.PI / 100;
        const isHorizontal = orientation === 'parallel' ||
            positiveAngle < tolerance || positiveAngle > Math.PI - tolerance;
        const isVertical = orientation === 'perpendicular' ||
            Math.abs(Math.PI / 2 - positiveAngle) < tolerance;

        return {
            horizontal: (isHorizontal && orientation !== 'perpendicular') ? 'center' : (isUpward === isAbove) ? 'start' : 'end',
            vertical: isVertical ? 'center' : isAbove ? 'bottom' : 'top'
        }
    };

    class VisualRelationship {
        constructor(resolvedRelationship, graph, arrow, editing, measureTextContext, imageCache) {
            this.resolvedRelationship = resolvedRelationship;
            this.arrow = arrow;
            this.editing = editing;

            const style = styleAttribute => getStyleSelector(resolvedRelationship.relationship, styleAttribute, graph);

            const orientationName = style('detail-orientation');
            const positionName = style('detail-position');
            this.componentRotation = readableAngle(orientationName, arrow.shaftAngle());
            const alignment = alignmentForShaftAngle(orientationName, positionName, arrow.shaftAngle());

            this.components = new ComponentStack();
            const iconImage = style('relationship-icon-image');
            const hasIcon = !!iconImage;
            const hasType = !!resolvedRelationship.type;
            const hasProperties = Object.keys(resolvedRelationship.relationship.properties).length > 0;

            if (hasIcon) {
                this.components.push(this.icon = new IconOutside('relationship-icon-image', alignment, editing, style, imageCache));
            }
            if (hasType) {
                this.components.push(this.type = new RelationshipType(
                    resolvedRelationship.type, alignment, editing, style, measureTextContext));
            }
            if (hasProperties) {
                this.components.push(this.properties = new PropertiesOutside(
                    resolvedRelationship.relationship.properties, alignment, editing, style, measureTextContext));
            }

            const width = this.components.maxWidth();
            const height = this.components.totalHeight();
            const margin = arrow.dimensions.arrowWidth;

            switch (orientationName) {
                case 'horizontal':
                    const shaftAngle = arrow.shaftAngle();
                    this.componentOffset = horizontalOffset(width, height, margin, alignment, shaftAngle);
                    break

                case 'parallel':
                    this.componentOffset = parallelOffset(height, margin, positionName);
                    break

                case 'perpendicular':
                    this.componentOffset = perpendicularOffset(height, margin, alignment);
                    break
            }
        }

        get id() {
            return this.resolvedRelationship.id
        }

        boundingBox() {
            const midPoint = this.arrow.midPoint();

            if (this.components.isEmpty()) {
                return boundingBoxOfPoints([midPoint])
            }

            const points = this.components.boundingBox().corners();
            const transformedPoints = points.map(point => point
                .translate(this.componentOffset)
                .rotate(this.componentRotation)
                .translate(midPoint.vectorFromOrigin()));

            return boundingBoxOfPoints([midPoint, ...transformedPoints])
        }

        distanceFrom(point) {
            const localPoint = point.translate(this.arrow.midPoint().vectorFromOrigin().invert());
            const componentPoint = localPoint.rotate(-this.componentRotation).translate(this.componentOffset.invert());
            return Math.min(
                this.arrow.distanceFrom(point),
                this.components.distanceFrom(componentPoint)
            )
        }

        draw(ctx) {
            if (this.resolvedRelationship.from.status === 'combined' && this.resolvedRelationship.to.status === 'combined' &&
                this.resolvedRelationship.from.superNodeId === this.resolvedRelationship.to.superNodeId) {
                return
            }

            ctx.save('relationship');

            if (this.resolvedRelationship.selected) {
                this.arrow.drawSelectionIndicator(ctx);

                ctx.save();
                ctx.translate(...this.arrow.midPoint().xy);
                ctx.rotate(this.componentRotation);
                ctx.translate(...this.componentOffset.dxdy);

                this.components.drawSelectionIndicator(ctx);

                ctx.restore();
            }
            this.arrow.draw(ctx);

            ctx.save();
            ctx.translate(...this.arrow.midPoint().xy);
            ctx.rotate(this.componentRotation);
            ctx.translate(...this.componentOffset.dxdy);

            this.components.draw(ctx);

            ctx.restore();
            ctx.restore();
        }
    }

    const horizontalOffset = (width, height, margin, alignment, shaftAngle) => {
        if (alignment.horizontal === 'center' && alignment.vertical === 'center') {
            return new Vector(0, -height / 2)
        }

        const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle;
        const mx = margin * Math.sin(positiveAngle);
        const my = margin * Math.abs(Math.cos(positiveAngle));

        let dx, dy;

        dx = (() => {
            switch (alignment.horizontal) {
                case 'start':
                    return mx

                case 'center':
                    return width / 2

                default:
                    return -mx
            }
        })();
        dy = (() => {
            switch (alignment.vertical) {
                case 'top':
                    return my

                case 'center':
                    return -(height + my)

                default:
                    return -(height + my)
            }
        })();

        const d = ((alignment.horizontal === 'end' ? 1 : -1) * width * Math.cos(shaftAngle) +
            (alignment.vertical === 'top' ? -1 : 1) * height * Math.sin(shaftAngle)) / 2;

        return new Vector(dx, dy).plus(new Vector(d, 0).rotate(shaftAngle))
    };

    const parallelOffset = (height, margin, positionName) => {
        const verticalPosition = (() => {
            switch (positionName) {
                case 'above':
                    return -(height + margin)
                case 'inline':
                    return -height / 2
                case 'below':
                    return margin
            }
        })();
        return new Vector(0, verticalPosition)
    };

    const perpendicularOffset = (height, margin, alignment) => {
        const horizontalPosition = (() => {
            switch (alignment.horizontal) {
                case 'start':
                    return margin

                case 'end':
                    return -margin

                default:
                    return 0
            }
        })();
        return new Vector(horizontalPosition, -height / 2)
    };

    const nodeSelected = (selection, nodeId) => {
        return selection.entities.some(entity =>
            entity.entityType === 'node' && entity.id === nodeId
        )
    };

    const nodeEditing = (selection, nodeId) => {
        return selection.editing &&
            selection.editing.entityType === 'node' && selection.editing.id === nodeId
    };

    const relationshipSelected = (selection, relationshipId) => {
        return selection.entities.some(entity =>
            entity.entityType === 'relationship' && entity.id === relationshipId
        )
    };

    const relationshipEditing = (selection, relationshipId) => {
        return selection.editing &&
            selection.editing.entityType === 'relationship' && selection.editing.id === relationshipId
    };

    class BalloonArrow {
        constructor(nodeCentre, nodeRadius, angle, separation, length, arcRadius, dimensions) {
            this.nodeCentre = nodeCentre;
            this.nodeRadius = nodeRadius;
            this.angle = angle;
            this.length = length;
            this.arcRadius = arcRadius;
            this.dimensions = dimensions;

            this.displacement = separation / 2;
            this.deflection = (this.displacement * 0.6) / nodeRadius;

            this.startAttach = new Point(nodeRadius, 0).rotate(-this.deflection);
            this.endShaft = new Point(nodeRadius + dimensions.headHeight - dimensions.chinHeight, 0).rotate(this.deflection);

            this.control = this.startAttach.x * this.displacement / -this.startAttach.y;
        }

        distanceFrom(point) {
            const localPoint = point.translate(this.nodeCentre.vectorFromOrigin().invert()).rotate(-this.angle);
            const rectangle = new BoundingBox(this.nodeRadius, this.length - this.displacement, -(this.displacement + this.dimensions.arrowWidth / 2), this.displacement + this.dimensions.arrowWidth / 2);
            const turnCentre = new Point(this.length - this.displacement, 0);
            return rectangle.contains(localPoint) || turnCentre.vectorFrom(localPoint).distance() < this.displacement + this.dimensions.arrowWidth / 2 ? 0 : Infinity
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(...this.nodeCentre.xy);
            ctx.rotate(this.angle);
            ctx.beginPath();
            this.path(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth;
            ctx.strokeStyle = this.dimensions.arrowColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.rotate(Math.PI + this.deflection);
                ctx.translate(-this.nodeRadius, 0);
                ctx.fillStyle = this.dimensions.arrowColor;
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false);
                ctx.fill();
            }
            ctx.restore();
        }

        drawSelectionIndicator(ctx) {
            const indicatorWidth = 10;
            ctx.save();
            ctx.translate(...this.nodeCentre.xy);
            ctx.rotate(this.angle);
            ctx.beginPath();
            this.path(ctx);
            ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = this.dimensions.selectionColor;
            ctx.stroke();
            if (this.dimensions.hasArrowHead) {
                ctx.rotate(Math.PI + this.deflection);
                ctx.translate(-this.nodeRadius, 0);
                ctx.lineWidth = indicatorWidth;
                ctx.lineJoin = 'round';
                arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true);
                ctx.stroke();
            }
            ctx.restore();
        }

        path(ctx) {
            ctx.moveTo(this.startAttach.x, this.startAttach.y);
            ctx.arcTo(this.control, -this.displacement, this.length / 2, -this.displacement, this.arcRadius);
            ctx.arcTo(this.length, -this.displacement, this.length, 0, this.displacement);
            ctx.arcTo(this.length, this.displacement, this.length / 2, this.displacement, this.displacement);
            ctx.arcTo(this.control, this.displacement, this.endShaft.x, this.endShaft.y, this.arcRadius);
            ctx.lineTo(this.endShaft.x, this.endShaft.y);
        }

        midPoint() {
            return new Point(this.length - this.displacement, 0).rotate(this.angle).translate(this.nodeCentre.vectorFromOrigin())
        }

        shaftAngle() {
            return perpendicular(this.angle)
        }

        get arrowKind() {
            return 'loopy'
        }
    }

    const clockwiseAngularSpace = (angles) => {
        if (angles.length === 0) return {
            gap: 2 * Math.PI,
            start: 0
        }

        const sorted = angles.slice(0).sort((a, b) => a - b);
        let gap = 0;
        let start = undefined;
        for (let i = 0; i < sorted.length; i++) {
            const previous = i === 0 ? sorted[sorted.length - 1] - 2 * Math.PI : sorted[i - 1];
            const current = sorted[i];

            if (current - previous > gap) {
                gap = current - previous;
                start = previous;
            }
        }
        return {
            gap,
            start
        }
    };

    class RoutedRelationshipBundle {
        constructor(relationships, graph, selection, measureTextContext, imageCache) {
            const arrows = [];

            const leftNode = relationships[0].from;
            const rightNode = relationships[0].to;

            const arrowDimensions = relationships.map(relationship => relationshipArrowDimensions(relationship, graph, leftNode));

            const leftRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.startRadius : arrow.endRadius));
            const rightRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.endRadius : arrow.startRadius));
            const maxLeftHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? 0 : arrow.headHeight));
            const maxRightHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.headHeight : 0));
            const relationshipSeparation = Math.max(...arrowDimensions.map(arrow => arrow.separation));

            if (relationships[0].startAttachment || relationships[0].endAttachment) {
                if (relationships[0].startAttachment && relationships[0].endAttachment) {
                    console.log('recti');
                    for (let i = 0; i < relationships.length; i++) {
                        const dimensions = arrowDimensions[i];
                        const relationship = relationships[i];

                        arrows[i] = new RectilinearArrow(
                            relationship.from.position,
                            relationship.to.position,
                            dimensions.startRadius,
                            dimensions.endRadius,
                            relationship.startAttachment,
                            relationship.endAttachment,
                            dimensions
                        );
                    }
                } else {
                    console.log('elbow', relationships);
                    for (let i = 0; i < relationships.length; i++) {
                        const dimensions = arrowDimensions[i];
                        const relationship = relationships[i];

                        arrows[i] = new ElbowArrow(
                            relationship.from.position,
                            relationship.to.position,
                            dimensions.startRadius,
                            dimensions.endRadius,
                            relationship.startAttachment,
                            relationship.endAttachment,
                            dimensions
                        );
                    }
                }
            } else if (leftNode === rightNode) {
                const selfNode = leftNode;
                const neighbourAngles = neighbourPositions(selfNode, graph).map(position => position.vectorFrom(selfNode.position).angle());
                const biggestAngularSpace = clockwiseAngularSpace(neighbourAngles);
                const angularSeparation = biggestAngularSpace.gap / (relationships.length + Math.sign(neighbourAngles.length));

                for (let i = 0; i < relationships.length; i++) {
                    const dimensions = arrowDimensions[i];

                    arrows[i] = new BalloonArrow(
                        selfNode.position,
                        dimensions.startRadius,
                        normaliseAngle(biggestAngularSpace.start + (i + 1) * angularSeparation),
                        relationshipSeparation,
                        dimensions.startRadius * 4,
                        40,
                        dimensions
                    );
                }
            } else {
                const firstDisplacement = -(relationships.length - 1) * relationshipSeparation / 2;
                const middleRelationshipIndex = (relationships.length - 1) / 2;

                const maxDeflection = Math.PI / 2;
                let leftTightening = 0.6;
                if (relationshipSeparation * (relationships.length - 1) * leftTightening / leftRadius > maxDeflection) {
                    leftTightening = maxDeflection * leftRadius / (relationshipSeparation * (relationships.length - 1));
                }
                if ((leftRadius + maxLeftHeadHeight) * Math.sin(leftTightening * -firstDisplacement / leftRadius) > -firstDisplacement) {
                    leftTightening = Math.asin(firstDisplacement / (leftRadius + maxLeftHeadHeight)) * leftRadius / firstDisplacement;
                }

                let rightTightening = 0.6;
                if (relationshipSeparation * (relationships.length - 1) * rightTightening / rightRadius > maxDeflection) {
                    rightTightening = maxDeflection * rightRadius / (relationshipSeparation * (relationships.length - 1));
                }
                if ((rightRadius + maxRightHeadHeight) * Math.sin(rightTightening * -firstDisplacement / rightRadius) > -firstDisplacement) {
                    rightTightening = Math.asin(firstDisplacement / (rightRadius + maxRightHeadHeight)) * rightRadius / firstDisplacement;
                }

                let possibleToDrawParallelArrows = true;

                for (let i = 0; i < relationships.length; i++) {
                    const relationship = relationships[i];
                    const dimensions = arrowDimensions[i];

                    if (i === middleRelationshipIndex) {
                        arrows[i] = normalStraightArrow(
                            relationship.from.position,
                            relationship.to.position,
                            dimensions.startRadius,
                            dimensions.endRadius,
                            dimensions
                        );
                    } else {
                        const displacement = (firstDisplacement + i * relationshipSeparation) * (dimensions.leftToRight ? 1 : -1);
                        const arrow = new ParallelArrow(
                            relationship.from.position,
                            relationship.to.position,
                            dimensions.startRadius,
                            dimensions.endRadius,
                            displacement * (dimensions.leftToRight ? leftTightening / leftRadius : rightTightening / rightRadius),
                            displacement * (dimensions.leftToRight ? rightTightening / rightRadius : leftTightening / leftRadius),
                            displacement,
                            40,
                            dimensions
                        );
                        possibleToDrawParallelArrows &= arrow.drawArcs;
                        arrows[i] = arrow;
                    }
                }

                if (!possibleToDrawParallelArrows) {
                    for (let i = 0; i < arrows.length; i++) {
                        if (i !== middleRelationshipIndex) {
                            const parallelArrow = arrows[i];
                            arrows[i] = new StraightArrow(
                                parallelArrow.startCentre,
                                parallelArrow.endCentre,
                                parallelArrow.startAttach,
                                parallelArrow.endAttach,
                                arrowDimensions[i]
                            );
                        }
                    }
                }
            }

            this.routedRelationships = [];
            for (let i = 0; i < relationships.length; i++) {
                const relationship = relationships[i];

                this.routedRelationships.push(new VisualRelationship(
                    relationship, graph, arrows[i], relationshipEditing(selection, relationship.id), measureTextContext, imageCache
                ));
            }
        }

        boundingBox() {
            return combineBoundingBoxes(this.routedRelationships
                .map(routedRelationship => routedRelationship.boundingBox()))
        }

        draw(ctx) {
            this.routedRelationships.forEach(routedRelationship => {
                routedRelationship.draw(ctx);
            });
        }
    }

    class VisualGraph {
        constructor(graph, nodes, relationshipBundles) {
            this.graph = graph;
            this.nodes = nodes;
            this.relationshipBundles = relationshipBundles;
        }

        get style() {
            return this.graph.style
        }

        entityAtPoint(point) {
            const node = this.nodeAtPoint(point);
            if (node) return { ...node,
                entityType: 'node'
            }

            const nodeRing = this.nodeRingAtPoint(point);
            if (nodeRing) return { ...nodeRing,
                entityType: 'nodeRing'
            }

            const relationship = this.relationshipAtPoint(point);
            if (relationship) return { ...relationship,
                entityType: 'relationship'
            }

            return null
        }

        nodeAtPoint(point) {
            return this.closestNode(point, (visualNode, distance) => {
                return distance < visualNode.radius
            })
        }

        nodeRingAtPoint(point) {
            return this.closestNode(point, (visualNode, distance) => {
                const nodeRadius = visualNode.radius;
                return distance > nodeRadius && distance < nodeRadius + ringMargin
            })
        }

        entitiesInBoundingBox(boundingBox) {
            const nodes = this.graph.nodes.filter(node => boundingBox.contains(node.position))
                .map(node => ({ ...node,
                    entityType: 'node'
                }));
            const relationships = this.relationshipBundles.flatMap(bundle => bundle.routedRelationships)
                .filter(routedRelationship => boundingBox.contains(routedRelationship.arrow.midPoint()))
                .map(routedRelationship => routedRelationship.resolvedRelationship)
                .map(relationship => ({ ...relationship,
                    entityType: 'relationship'
                }));

            return [...nodes, ...relationships]
        }

        closestNode(point, hitTest) {
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestNode = null;
            this.graph.nodes.filter(node => node.status !== 'combined').forEach((node) => {
                const visualNode = this.nodes[node.id];
                const distance = visualNode.distanceFrom(point);
                if (distance < closestDistance && hitTest(visualNode, distance)) {
                    closestDistance = distance;
                    closestNode = node;
                }
            });
            return closestNode
        }

        relationshipAtPoint(point) {
            return this.closestRelationship(point, (relationship, distance) => distance <= relationshipHitTolerance)
        }

        closestRelationship(point, hitTest) {
            let minDistance = Number.POSITIVE_INFINITY;
            let closestRelationship = null;
            this.relationshipBundles.forEach(bundle => {
                bundle.routedRelationships.forEach(routedRelationship => {
                    const distance = routedRelationship.distanceFrom(point);
                    if (distance < minDistance && hitTest(routedRelationship.resolvedRelationship, distance)) {
                        minDistance = distance;
                        closestRelationship = routedRelationship.resolvedRelationship;
                    }
                });
            });

            return closestRelationship
        }

        draw(ctx, displayOptions) {
            ctx.save();
            const viewTransformation = displayOptions.viewTransformation;
            ctx.translate(viewTransformation.translateVector.dx, viewTransformation.translateVector.dy);
            ctx.scale(viewTransformation.scale);
            this.relationshipBundles.forEach(bundle => bundle.draw(ctx));
            Object.values(this.nodes).forEach(visualNode => {
                visualNode.draw(ctx);
            });
            ctx.restore();
        }

        boundingBox() {
            const nodeBoxes = Object.values(this.nodes).map(node => node.boundingBox());
            const relationshipBoxes = Object.values(this.relationshipBundles).map(bundle => bundle.boundingBox());
            return combineBoundingBoxes([...nodeBoxes, ...relationshipBoxes])
        }
    }

    class NodePair {
        constructor(node1, node2, start, end) {
            if (node1.id < node2.id) {
                this.nodeA = node1;
                this.attachA = start;
                this.nodeB = node2;
                this.attachB = end;
            } else {
                this.nodeA = node2;
                this.attachA = end;
                this.nodeB = node1;
                this.attachB = start;
            }
        }

        key() {
            return `${this.nodeA.id}:${this.nodeB.id}:${attachKey(this.attachA)}:${attachKey(this.attachB)}`
        }
    }

    const attachKey = (attach) => {
        if (attach) {
            return attach.attachment.name
        }
        return 'normal'
    };

    const bundle = (relationships) => {
        const bundles = {};
        relationships.forEach(r => {
            const nodePair = new NodePair(r.from, r.to, r.startAttachment, r.endAttachment);
            const bundle = bundles[nodePair.key()] || (bundles[nodePair.key()] = []);
            bundle.push(r);
        });
        return Object.values(bundles)
    };

    class CanvasAdaptor {
        constructor(ctx) {
            this.ctx = ctx;
        }

        save() {
            this.ctx.save();
        }

        restore() {
            this.ctx.restore();
        }

        translate(dx, dy) {
            this.ctx.translate(dx, dy);
        }

        scale(x) {
            this.ctx.scale(x, x);
        }

        rotate(angle) {
            this.ctx.rotate(angle);
        }

        beginPath() {
            this.ctx.beginPath();
        }

        closePath() {
            this.ctx.closePath();
        }

        moveTo(x, y) {
            this.ctx.moveTo(x, y);
        }


        lineTo(x, y) {
            this.ctx.lineTo(x, y);
        }

        arcTo(x1, y1, x2, y2, radius) {
            this.ctx.arcTo(x1, y1, x2, y2, radius);
        }

        arc(x, y, radius, startAngle, endAngle, anticlockwise) {
            this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        }

        circle(x, y, radius, fill, stroke) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.closePath();
            if (fill) this.ctx.fill();
            if (stroke) this.ctx.stroke();
        }

        rect(x, y, width, height, r, fill, stroke) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + r);
            this.ctx.arc(x + r, y + r, r, -Math.PI, -Math.PI / 2);
            this.ctx.lineTo(x + width - r, y);
            this.ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
            this.ctx.lineTo(x + width, y + height - r);
            this.ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
            this.ctx.lineTo(x + r, y + height);
            this.ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
            this.ctx.closePath();
            if (fill) this.ctx.fill();
            if (stroke) this.ctx.stroke();
        }

        image(imageInfo, x, y, width, height) {
            try {
                this.ctx.drawImage(imageInfo.image, x, y, width, height);
            } catch (e) {
                console.error(e);
            }
        }

        imageInCircle(imageInfo, cx, cy, radius) {
            const ratio = imageInfo.width / imageInfo.height;
            const {
                width,
                height
            } =
            (imageInfo.width > imageInfo.height) ? {
                width: 2 * radius * ratio,
                height: 2 * radius
            } : {
                width: 2 * radius,
                height: 2 * radius / ratio
            };
            this.ctx.save();
            try {
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                this.ctx.clip();
                this.ctx.drawImage(imageInfo.image, cx - width / 2, cy - height / 2, width, height);
            } catch (e) {
                console.error(e);
            } finally {
                this.ctx.restore();
            }
        }

        polyLine(points) {
            this.ctx.beginPath();
            if (points.length > 0) {
                const startPoint = points[0];
                this.ctx.moveTo(startPoint.x, startPoint.y);
            }
            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.stroke();
        }

        polygon(points, fill, stroke) {
            this.ctx.beginPath();
            if (points.length > 0) {
                const startPoint = points[0];
                this.ctx.moveTo(startPoint.x, startPoint.y);
            }
            for (let i = 1; i < points.length; i++) {
                const point = points[i];
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.closePath();
            if (fill) this.ctx.fill();
            if (stroke) this.ctx.stroke();
        }

        stroke() {
            this.ctx.stroke();
        }

        fill() {
            this.ctx.fill();
        }

        fillText(text, x, y) {
            this.ctx.fillText(text, x, y);
        }

        measureText(text) {
            return this.ctx.measureText(text)
        }

        setLineDash(dash) {
            this.ctx.setLineDash(dash);
        }

        set fillStyle(color) {
            this.ctx.fillStyle = color;
        }

        set font(style) {
            this.ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
        }

        set textBaseline(value) {
            this.ctx.textBaseline = value;
        }

        set textAlign(value) {
            this.ctx.textAlign = value;
        }

        set lineWidth(value) {
            this.ctx.lineWidth = value;
        }

        set lineJoin(value) {
            this.ctx.lineJoin = value;
        }

        set lineCap(value) {
            this.ctx.lineCap = value;
        }

        set strokeStyle(value) {
            this.ctx.strokeStyle = value;
        }
    }

    const measureTextContext = (() => {
        const canvas = window.document.createElement('canvas');
        return new CanvasAdaptor(canvas.getContext('2d'))
    })();

    function getVisualNode(node, graph, selection, cachedImages) {
        return new VisualNode(
            node,
            graph,
            nodeSelected(selection, node.id),
            nodeEditing(selection, node.id),
            measureTextContext,
            cachedImages
        )
    }

    function getVisualGraph(graph, selection, cachedImages) {
        // node -> VisualNode
        const visualNodes = graph.nodes.reduce((nodeMap, node) => {
            nodeMap[node.id] = getVisualNode(node, graph, selection, cachedImages);
            return nodeMap
        }, {});

        // 计算边
        const relationshipAttachments = computeRelationshipAttachments(graph, visualNodes);

        // relationship -> ResolvedRelationship
        const resolvedRelationships = graph.relationships.map(relationship =>
            new ResolvedRelationship(
                relationship,
                visualNodes[relationship.fromId],
                visualNodes[relationship.toId],
                relationshipAttachments.start[relationship.id],
                relationshipAttachments.end[relationship.id],
                // 是否被选中
                relationshipSelected(selection, relationship.id),
                graph
            )
        );
        
        // 对应的边的箭头样式
        const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
            return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext, cachedImages);
        });

        // 可视化图
        return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
    }

    const canvasPadding = 50;

    // import {

    const calculateViewportTranslation = (visualGraph, canvasSize) => {
        const boundingBox = visualGraph.boundingBox();

        if (boundingBox) {
            let visualsWidth = (boundingBox.right - boundingBox.left);
            let visualsHeight = (boundingBox.bottom - boundingBox.top);
            let visualsCenter = new Point((boundingBox.right + boundingBox.left) / 2, (boundingBox.bottom + boundingBox.top) / 2);

            const viewportWidth = canvasSize.width - canvasPadding * 2;
            const viewportHeight = canvasSize.height - canvasPadding * 2;
            const viewportCenter = new Point(canvasPadding + viewportWidth / 2, canvasPadding + viewportHeight / 2);

            let scale = Math.min(1, Math.min(viewportHeight / visualsHeight, viewportWidth / visualsWidth));

            if (scale !== 1) {
                visualsCenter = new Point(scale * (boundingBox.right + boundingBox.left) / 2, scale * (boundingBox.bottom + boundingBox.top) / 2);
            }

            return {
                scale,
                translateVector: viewportCenter.vectorFrom(visualsCenter)
            }
        } else {
            return {}
        }
    };

    // export const viewportMiddleware = store => next => action => {
    //     const result = next(action)

    //     if (!action.autoGenerated && observedActionTypes.includes(action.type)) {
    //         const state = store.getState()
    //         const {
    //             applicationLayout,
    //             viewTransformation,
    //             mouse
    //         } = state
    //         const canvasSize = computeCanvasSize(applicationLayout)
    //         const visualGraph = getVisualGraph(state)

    //         if (action.type === 'MOVE_NODES') {
    //             const shouldScaleUp = nodeMovedOutsideCanvas(visualGraph, canvasSize, viewTransformation, action)
    //             if (shouldScaleUp) {
    //                 let {
    //                     scale,
    //                     translateVector
    //                 } = calculateViewportTranslation(visualGraph, canvasSize)

    //                 store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))

    //                 if (mouse.mouseToNodeVector) {
    //                     const newViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy))
    //                     const mousePositionInGraph = newViewTransformation.inverse(action.newMousePosition || mouse.mousePosition)

    //                     const expectedNodePositionbyMouse = mousePositionInGraph.translate(mouse.mouseToNodeVector.scale(viewTransformation.scale))
    //                     const differenceVector = expectedNodePositionbyMouse.vectorFrom(action.nodePositions[0].position)

    //                     // if (differenceVector.distance() > 1) {
    //                     //     window.requestAnimationFrame(() => store.dispatch(tryMoveNode({
    //                     //         nodeId: action.nodePositions[0].nodeId,
    //                     //         oldMousePosition: action.oldMousePosition,
    //                     //         newMousePosition: null,
    //                     //         forcedNodePosition: expectedNodePositionbyMouse
    //                     //     })))
    //                     // }
    //                 }
    //             }
    //         } else {
    //             let {
    //                 scale,
    //                 translateVector
    //             } = calculateViewportTranslation(visualGraph, canvasSize)

    //             if (scale) {
    //                 if (action.type === 'MOVE_NODES_END_DRAG') {
    //                     if (scale > viewTransformation.scale) {
    //                         let currentStep = 0
    //                         let duration = 1000
    //                         let fps = 60

    //                         const targetViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy))
    //                         const {
    //                             scaleTable,
    //                             panningTable
    //                         } = calculateTransformationTable(viewTransformation, targetViewTransformation, duration / fps)

    //                         const animateScale = () => {
    //                             setTimeout(() => {
    //                                 const nextScale = scaleTable[currentStep]
    //                                 const nextPan = panningTable[currentStep]

    //                                 store.dispatch(adjustViewport(nextScale, nextPan.dx, nextPan.dy))

    //                                 currentStep++
    //                                 if (currentStep < scaleTable.length) {
    //                                     window.requestAnimationFrame(animateScale)
    //                                 }
    //                             }, 1000 / fps)
    //                         }

    //                         window.requestAnimationFrame(animateScale)
    //                     }
    //                 } else {
    //                     store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))
    //                 }
    //             }
    //         }
    //     }

    //     return result
    // }

    // const calculateTransformationTable = (currentViewTransformation, targetViewTransformation, totalSteps) => {
    //     let lastScale = currentViewTransformation.scale
    //     const targetScale = targetViewTransformation.scale
    //     const scaleByStep = (targetScale - lastScale) / totalSteps

    //     let lastPan = {
    //         dx: currentViewTransformation.offset.dx,
    //         dy: currentViewTransformation.offset.dy
    //     }
    //     const panByStep = {
    //         dx: (targetViewTransformation.offset.dx - lastPan.dx) / totalSteps,
    //         dy: (targetViewTransformation.offset.dy - lastPan.dy) / totalSteps
    //     }

    //     const scaleTable = []
    //     const panningTable = []
    //     let stepIndex = 0

    //     while (stepIndex < totalSteps - 1) {
    //         lastScale += scaleByStep
    //         lastPan = {
    //             dx: lastPan.dx + panByStep.dx,
    //             dy: lastPan.dy + panByStep.dy
    //         }

    //         scaleTable.push(lastScale)
    //         panningTable.push(lastPan)

    //         stepIndex++
    //     }

    //     // because of decimal figures does not sum up to exact number
    //     scaleTable.push(targetViewTransformation.scale)
    //     panningTable.push(targetViewTransformation.offset)

    //     return {
    //         scaleTable,
    //         panningTable
    //     }
    // }

    function merge(target, source) {
        Object.keys(source).forEach((property) => {
            target[property] = source[property];
        });
    }

    // canvas layer manager
    const layerManager = (() => {
        let layers = [];
        return {
            register: (name, drawFunction) => layers.push({
                name,
                draw: drawFunction
            }),
            clear: () => {
                layers = [];
            },
            renderAll: (ctx, displayOptions) => {
                layers.forEach(layer => layer.draw(ctx, displayOptions));
            }
        }
    })();

    class ArrowApp {
        constructor(domString, graph, options) {
            this.canvas = document.getElementById(domString);
            this.selection = {
                editing: undefined,
                entities: []
            };

            this.options = {
                width: '100%',
                height: '100%'
            };

            merge(this.options, options);

            this.initPointClass(graph);

            this.fitCanvasSize(this.canvas, this.options);
            const visualGraph = getVisualGraph(graph, this.selection, '');
            this.options.viewTransformation = calculateViewportTranslation(visualGraph, {width: this.options.width, height: this.options.height});
            // console.log(res)

            this.renderVisuals({
                visualGraph,
                displayOptions: this.options
            });
        }

        // 给节点的每一个点装上Point类
        initPointClass(graph) {
            graph.nodes = graph.nodes.map(item => ({
                ...item,
                position: new Point(item.position.x, item.position.y)
            }));
        }

        fitCanvasSize(canvas, {
            width, height
        }) {
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            const context = canvas.getContext('2d');

            const devicePixelRatio = window.devicePixelRatio || 1;
            const backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
            const ratio = devicePixelRatio / backingStoreRatio;

            if (devicePixelRatio !== backingStoreRatio) {
                canvas.width = width * ratio;
                canvas.height = height * ratio;

                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';

                // now scale the context to counter
                // the fact that we've manually scaled
                // our canvas element
                context.scale(ratio, ratio);
            }

            return ratio
        }

        // 可视化渲染
        renderVisuals({
            visualGraph,
            displayOptions
        }) {
            console.log(visualGraph, displayOptions);
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, displayOptions.width, displayOptions.height);
        
            // const visualGestures = new Gestures(visualGraph, gestures)
            // const visualGuides = new VisualGuides(visualGraph, guides)
        
            layerManager.clear();

            // layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
            // layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
            layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph));
        
            layerManager.renderAll(new CanvasAdaptor(ctx), displayOptions);
        }
    }

    return ArrowApp;

}));
