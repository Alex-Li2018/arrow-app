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

    const nodeStyleAttributes = styleAttributeGroups
        .filter(group => group.entityTypes.includes('node'))
        .flatMap(group => group.attributes)
        .map(attribute => attribute.key);

    const relationshipStyleAttributes = styleAttributeGroups
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

    const completeWithDefaults = (style) => {
        const completeStyle = {};
        Object.keys(styleAttributes).forEach(key => {
            if (style.hasOwnProperty(key)) {
                completeStyle[key] = style[key];
            } else {
                completeStyle[key] = styleAttributes[key].defaultValue;
            }
        });
        return completeStyle
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

    // 获取图谱的样式
    const graphStyleSelector = graph => graph.style || {};

    // 如果自身有style用自身的没有就用图谱的公用样式
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

    const moveTo = (node, newPosition) => {
        return {
            ...node,
            position: newPosition
        }
    };

    const addLabel = (node, label) => {
        const labels = node.labels.includes(label) ? node.labels : [...node.labels, label];
        return {
            ...node,
            labels: labels
        }
    };

    const renameLabel = (node, oldLabel, newLabel) => {
        const labels = [...node.labels];
        const index = labels.indexOf(oldLabel);
        if (index > -1) {
            labels[index] = newLabel;
        }
        return {
            ...node,
            labels: labels
        }
    };

    const removeLabel = (node, label) => {
        const labels = [...node.labels];
        const index = labels.indexOf(label);
        if (index > -1) {
            labels.splice(index, 1);
        }
        return {
            ...node,
            labels: labels
        }
    };

    const setCaption = (node, caption) => {
        return {
            ...node,
            caption
        }
    };

    const setType = (relationship, type) => {
        return {
            id: relationship.id,
            type,
            style: relationship.style,
            properties: relationship.properties,
            fromId: relationship.fromId,
            toId: relationship.toId
        }
    };

    const reverse = relationship => {
        return {
            id: relationship.id,
            type: relationship.type,
            style: relationship.style,
            properties: relationship.properties,
            toId: relationship.fromId,
            fromId: relationship.toId
        }
    };

    const otherNodeId = (relationship, nodeId) => {
        if (relationship.fromId === nodeId) {
            return relationship.toId
        }
        if (relationship.toId === nodeId) {
            return relationship.fromId
        }
        return undefined
    };

    const renameProperty = (entity, oldPropertyKey, newPropertyKey) => {
        const properties = {};
        Object.keys(entity.properties).forEach((key) => {
            if (key === oldPropertyKey) {
                properties[newPropertyKey] = entity.properties[oldPropertyKey];
            } else {
                properties[key] = entity.properties[key];
            }
        });
        return {
            ...entity,
            properties
        }
    };

    const setProperty = (entity, key, value) => {
        const properties = { ...entity.properties
        };
        properties[key] = value;
        return {
            ...entity,
            properties
        }
    };

    const setArrowsProperty = (entity, key, value) => {
        const newEntity = { ...entity
        };

        if (!newEntity.style) {
            newEntity.style = {};
        }

        newEntity.style[key] = value;
        Object.defineProperty(newEntity, key, {
            get: function() {
                return this.style[key]
            }
        });

        return newEntity
    };

    const removeProperty = (entity, keyToRemove) => {
        const properties = {};
        Object.keys(entity.properties).forEach((key) => {
            if (key !== keyToRemove) {
                properties[key] = entity.properties[key];
            }
        });
        return {
            ...entity,
            properties
        }
    };

    const removeArrowsProperty = (entity, keyToRemove) => {
        const style = { ...entity.style
        };
        delete style[keyToRemove];
        return {
            ...entity,
            style
        }
    };

    function idsMatch(a, b) {
        return a === b
    }

    function nextAvailableId(entities, prefix = 'n') {
        const currentIds = entities.map((entity) => entity.id)
            .filter((id) => new RegExp(`^${prefix}[0-9]+$`).test(id))
            .map((id) => parseInt(id.substring(1)))
            .sort((x, y) => x - y);

        return prefix + (currentIds.length > 0 ? currentIds.pop() + 1 : 0)
    }

    const emptyGraph = () => {
        return {
            nodes: [{
                id: nextAvailableId([]),
                position: new Point(0, 0),
                caption: '',
                style: {},
                labels: [],
                properties: {}
            }],
            relationships: [],
            style: completeWithDefaults({})
        }
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

            // 是否有图片
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

            // if (hasProperties) {
            //     switch (propertyPosition) {
            //         case 'inside':
            //             this.insideComponents.push(this.properties = new NodePropertiesInside(
            //                 node.properties, editing, style, measureTextContext))
            //             break

            //         default:
            //             this.outsideComponents.push(this.properties = new PropertiesOutside(
            //                 node.properties, this.outsideOrientation, editing, style, measureTextContext))
            //     }
            // }

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
            // 节点内部的组件
            this.insideComponents.draw(ctx);

            ctx.restore();

            ctx.save();
            ctx.translate(...this.outsideOffset.dxdy);
            // 节点外部的组件
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

    const perpendicular = (angle) => {
        return normaliseAngle(angle + Math.PI / 2)
    };

    const normaliseAngle = (angle) => {
        let goodAngle = angle;
        while (goodAngle < -Math.PI) goodAngle += 2 * Math.PI;
        while (goodAngle > Math.PI) goodAngle -= 2 * Math.PI;
        return goodAngle
    };

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

    const measureTextContext = (() => {
        const canvas = window.document.createElement('canvas');
        return new CanvasAdaptor(canvas.getContext('2d'))
    })();

    const getVisualNode = (node, graph, selection, cachedImages) => {
        return new VisualNode(
            node,
            graph,
            nodeSelected(selection, node.id),
            nodeEditing(selection, node.id),
            measureTextContext,
            cachedImages
        )
    };

    const getVisualGraph = (graph, selection, cachedImages) => {
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
    };

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

    /**
     * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
     *
     * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
     * during build.
     * @param {number} code
     */
    function formatProdErrorMessage(code) {
      return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + 'use the non-minified dev environment for full errors. ';
    }

    // Inlined version of the `symbol-observable` polyfill
    var $$observable = (function () {
      return typeof Symbol === 'function' && Symbol.observable || '@@observable';
    })();

    /**
     * These are private action types reserved by Redux.
     * For any unknown actions, you must return the current state.
     * If the current state is undefined, you must return the initial state.
     * Do not reference these action types directly in your code.
     */
    var randomString = function randomString() {
      return Math.random().toString(36).substring(7).split('').join('.');
    };

    var ActionTypes$1 = {
      INIT: "@@redux/INIT" + randomString(),
      REPLACE: "@@redux/REPLACE" + randomString(),
      PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
        return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
      }
    };

    /**
     * @param {any} obj The object to inspect.
     * @returns {boolean} True if the argument appears to be a plain object.
     */
    function isPlainObject(obj) {
      if (typeof obj !== 'object' || obj === null) return false;
      var proto = obj;

      while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
      }

      return Object.getPrototypeOf(obj) === proto;
    }

    // Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of
    function miniKindOf(val) {
      if (val === void 0) return 'undefined';
      if (val === null) return 'null';
      var type = typeof val;

      switch (type) {
        case 'boolean':
        case 'string':
        case 'number':
        case 'symbol':
        case 'function':
          {
            return type;
          }
      }

      if (Array.isArray(val)) return 'array';
      if (isDate(val)) return 'date';
      if (isError(val)) return 'error';
      var constructorName = ctorName(val);

      switch (constructorName) {
        case 'Symbol':
        case 'Promise':
        case 'WeakMap':
        case 'WeakSet':
        case 'Map':
        case 'Set':
          return constructorName;
      } // other


      return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
    }

    function ctorName(val) {
      return typeof val.constructor === 'function' ? val.constructor.name : null;
    }

    function isError(val) {
      return val instanceof Error || typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number';
    }

    function isDate(val) {
      if (val instanceof Date) return true;
      return typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function';
    }

    function kindOf(val) {
      var typeOfVal = typeof val;

      if (process.env.NODE_ENV !== 'production') {
        typeOfVal = miniKindOf(val);
      }

      return typeOfVal;
    }

    /**
     * @deprecated
     *
     * **We recommend using the `configureStore` method
     * of the `@reduxjs/toolkit` package**, which replaces `createStore`.
     *
     * Redux Toolkit is our recommended approach for writing Redux logic today,
     * including store setup, reducers, data fetching, and more.
     *
     * **For more details, please read this Redux docs page:**
     * **https://redux.js.org/introduction/why-rtk-is-redux-today**
     *
     * `configureStore` from Redux Toolkit is an improved version of `createStore` that
     * simplifies setup and helps avoid common bugs.
     *
     * You should not be using the `redux` core package by itself today, except for learning purposes.
     * The `createStore` method from the core `redux` package will not be removed, but we encourage
     * all users to migrate to using Redux Toolkit for all Redux code.
     *
     * If you want to use `createStore` without this visual deprecation warning, use
     * the `legacy_createStore` import instead:
     *
     * `import { legacy_createStore as createStore} from 'redux'`
     *
     */

    function createStore(reducer, preloadedState, enhancer) {
      var _ref2;

      if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(0) : 'It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.');
      }

      if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
        enhancer = preloadedState;
        preloadedState = undefined;
      }

      if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(1) : "Expected the enhancer to be a function. Instead, received: '" + kindOf(enhancer) + "'");
        }

        return enhancer(createStore)(reducer, preloadedState);
      }

      if (typeof reducer !== 'function') {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(2) : "Expected the root reducer to be a function. Instead, received: '" + kindOf(reducer) + "'");
      }

      var currentReducer = reducer;
      var currentState = preloadedState;
      var currentListeners = [];
      var nextListeners = currentListeners;
      var isDispatching = false;
      /**
       * This makes a shallow copy of currentListeners so we can use
       * nextListeners as a temporary list while dispatching.
       *
       * This prevents any bugs around consumers calling
       * subscribe/unsubscribe in the middle of a dispatch.
       */

      function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
          nextListeners = currentListeners.slice();
        }
      }
      /**
       * Reads the state tree managed by the store.
       *
       * @returns {any} The current state tree of your application.
       */


      function getState() {
        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(3) : 'You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
        }

        return currentState;
      }
      /**
       * Adds a change listener. It will be called any time an action is dispatched,
       * and some part of the state tree may potentially have changed. You may then
       * call `getState()` to read the current state tree inside the callback.
       *
       * You may call `dispatch()` from a change listener, with the following
       * caveats:
       *
       * 1. The subscriptions are snapshotted just before every `dispatch()` call.
       * If you subscribe or unsubscribe while the listeners are being invoked, this
       * will not have any effect on the `dispatch()` that is currently in progress.
       * However, the next `dispatch()` call, whether nested or not, will use a more
       * recent snapshot of the subscription list.
       *
       * 2. The listener should not expect to see all state changes, as the state
       * might have been updated multiple times during a nested `dispatch()` before
       * the listener is called. It is, however, guaranteed that all subscribers
       * registered before the `dispatch()` started will be called with the latest
       * state by the time it exits.
       *
       * @param {Function} listener A callback to be invoked on every dispatch.
       * @returns {Function} A function to remove this change listener.
       */


      function subscribe(listener) {
        if (typeof listener !== 'function') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(4) : "Expected the listener to be a function. Instead, received: '" + kindOf(listener) + "'");
        }

        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(5) : 'You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
        }

        var isSubscribed = true;
        ensureCanMutateNextListeners();
        nextListeners.push(listener);
        return function unsubscribe() {
          if (!isSubscribed) {
            return;
          }

          if (isDispatching) {
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(6) : 'You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
          }

          isSubscribed = false;
          ensureCanMutateNextListeners();
          var index = nextListeners.indexOf(listener);
          nextListeners.splice(index, 1);
          currentListeners = null;
        };
      }
      /**
       * Dispatches an action. It is the only way to trigger a state change.
       *
       * The `reducer` function, used to create the store, will be called with the
       * current state tree and the given `action`. Its return value will
       * be considered the **next** state of the tree, and the change listeners
       * will be notified.
       *
       * The base implementation only supports plain object actions. If you want to
       * dispatch a Promise, an Observable, a thunk, or something else, you need to
       * wrap your store creating function into the corresponding middleware. For
       * example, see the documentation for the `redux-thunk` package. Even the
       * middleware will eventually dispatch plain object actions using this method.
       *
       * @param {Object} action A plain object representing “what changed”. It is
       * a good idea to keep actions serializable so you can record and replay user
       * sessions, or use the time travelling `redux-devtools`. An action must have
       * a `type` property which may not be `undefined`. It is a good idea to use
       * string constants for action types.
       *
       * @returns {Object} For convenience, the same action object you dispatched.
       *
       * Note that, if you use a custom middleware, it may wrap `dispatch()` to
       * return something else (for example, a Promise you can await).
       */


      function dispatch(action) {
        if (!isPlainObject(action)) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(7) : "Actions must be plain objects. Instead, the actual type was: '" + kindOf(action) + "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.");
        }

        if (typeof action.type === 'undefined') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
        }

        if (isDispatching) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(9) : 'Reducers may not dispatch actions.');
        }

        try {
          isDispatching = true;
          currentState = currentReducer(currentState, action);
        } finally {
          isDispatching = false;
        }

        var listeners = currentListeners = nextListeners;

        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          listener();
        }

        return action;
      }
      /**
       * Replaces the reducer currently used by the store to calculate the state.
       *
       * You might need this if your app implements code splitting and you want to
       * load some of the reducers dynamically. You might also need this if you
       * implement a hot reloading mechanism for Redux.
       *
       * @param {Function} nextReducer The reducer for the store to use instead.
       * @returns {void}
       */


      function replaceReducer(nextReducer) {
        if (typeof nextReducer !== 'function') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(10) : "Expected the nextReducer to be a function. Instead, received: '" + kindOf(nextReducer));
        }

        currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
        // Any reducers that existed in both the new and old rootReducer
        // will receive the previous state. This effectively populates
        // the new state tree with any relevant data from the old one.

        dispatch({
          type: ActionTypes$1.REPLACE
        });
      }
      /**
       * Interoperability point for observable/reactive libraries.
       * @returns {observable} A minimal observable of state changes.
       * For more information, see the observable proposal:
       * https://github.com/tc39/proposal-observable
       */


      function observable() {
        var _ref;

        var outerSubscribe = subscribe;
        return _ref = {
          /**
           * The minimal observable subscription method.
           * @param {Object} observer Any object that can be used as an observer.
           * The observer object should have a `next` method.
           * @returns {subscription} An object with an `unsubscribe` method that can
           * be used to unsubscribe the observable from the store, and prevent further
           * emission of values from the observable.
           */
          subscribe: function subscribe(observer) {
            if (typeof observer !== 'object' || observer === null) {
              throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(11) : "Expected the observer to be an object. Instead, received: '" + kindOf(observer) + "'");
            }

            function observeState() {
              if (observer.next) {
                observer.next(getState());
              }
            }

            observeState();
            var unsubscribe = outerSubscribe(observeState);
            return {
              unsubscribe: unsubscribe
            };
          }
        }, _ref[$$observable] = function () {
          return this;
        }, _ref;
      } // When a store is created, an "INIT" action is dispatched so that every
      // reducer returns their initial state. This effectively populates
      // the initial state tree.


      dispatch({
        type: ActionTypes$1.INIT
      });
      return _ref2 = {
        dispatch: dispatch,
        subscribe: subscribe,
        getState: getState,
        replaceReducer: replaceReducer
      }, _ref2[$$observable] = observable, _ref2;
    }

    /**
     * Prints a warning in the console if it exists.
     *
     * @param {String} message The warning message.
     * @returns {void}
     */
    function warning(message) {
      /* eslint-disable no-console */
      if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
      }
      /* eslint-enable no-console */


      try {
        // This error was thrown as a convenience so that if you enable
        // "break on all exceptions" in your console,
        // it would pause the execution at this line.
        throw new Error(message);
      } catch (e) {} // eslint-disable-line no-empty

    }

    function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
      var reducerKeys = Object.keys(reducers);
      var argumentName = action && action.type === ActionTypes$1.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

      if (reducerKeys.length === 0) {
        return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
      }

      if (!isPlainObject(inputState)) {
        return "The " + argumentName + " has unexpected type of \"" + kindOf(inputState) + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
      }

      var unexpectedKeys = Object.keys(inputState).filter(function (key) {
        return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
      });
      unexpectedKeys.forEach(function (key) {
        unexpectedKeyCache[key] = true;
      });
      if (action && action.type === ActionTypes$1.REPLACE) return;

      if (unexpectedKeys.length > 0) {
        return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
      }
    }

    function assertReducerShape(reducers) {
      Object.keys(reducers).forEach(function (key) {
        var reducer = reducers[key];
        var initialState = reducer(undefined, {
          type: ActionTypes$1.INIT
        });

        if (typeof initialState === 'undefined') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(12) : "The slice reducer for key \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
        }

        if (typeof reducer(undefined, {
          type: ActionTypes$1.PROBE_UNKNOWN_ACTION()
        }) === 'undefined') {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(13) : "The slice reducer for key \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle '" + ActionTypes$1.INIT + "' or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
        }
      });
    }
    /**
     * Turns an object whose values are different reducer functions, into a single
     * reducer function. It will call every child reducer, and gather their results
     * into a single state object, whose keys correspond to the keys of the passed
     * reducer functions.
     *
     * @param {Object} reducers An object whose values correspond to different
     * reducer functions that need to be combined into one. One handy way to obtain
     * it is to use ES6 `import * as reducers` syntax. The reducers may never return
     * undefined for any action. Instead, they should return their initial state
     * if the state passed to them was undefined, and the current state for any
     * unrecognized action.
     *
     * @returns {Function} A reducer function that invokes every reducer inside the
     * passed object, and builds a state object with the same shape.
     */


    function combineReducers(reducers) {
      var reducerKeys = Object.keys(reducers);
      var finalReducers = {};

      for (var i = 0; i < reducerKeys.length; i++) {
        var key = reducerKeys[i];

        if (process.env.NODE_ENV !== 'production') {
          if (typeof reducers[key] === 'undefined') {
            warning("No reducer provided for key \"" + key + "\"");
          }
        }

        if (typeof reducers[key] === 'function') {
          finalReducers[key] = reducers[key];
        }
      }

      var finalReducerKeys = Object.keys(finalReducers); // This is used to make sure we don't warn about the same
      // keys multiple times.

      var unexpectedKeyCache;

      if (process.env.NODE_ENV !== 'production') {
        unexpectedKeyCache = {};
      }

      var shapeAssertionError;

      try {
        assertReducerShape(finalReducers);
      } catch (e) {
        shapeAssertionError = e;
      }

      return function combination(state, action) {
        if (state === void 0) {
          state = {};
        }

        if (shapeAssertionError) {
          throw shapeAssertionError;
        }

        if (process.env.NODE_ENV !== 'production') {
          var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);

          if (warningMessage) {
            warning(warningMessage);
          }
        }

        var hasChanged = false;
        var nextState = {};

        for (var _i = 0; _i < finalReducerKeys.length; _i++) {
          var _key = finalReducerKeys[_i];
          var reducer = finalReducers[_key];
          var previousStateForKey = state[_key];
          var nextStateForKey = reducer(previousStateForKey, action);

          if (typeof nextStateForKey === 'undefined') {
            var actionType = action && action.type;
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(14) : "When called with an action of type " + (actionType ? "\"" + String(actionType) + "\"" : '(unknown type)') + ", the slice reducer for key \"" + _key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.");
          }

          nextState[_key] = nextStateForKey;
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }

        hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
        return hasChanged ? nextState : state;
      };
    }

    /*
     * This is a dummy function to check if the function name has been altered by minification.
     * If the function has been minified and NODE_ENV !== 'production', warn the user.
     */

    function isCrushed() {}

    if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
      warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
    }

    const defaultName = 'Untitled graph';

    const diagramName = (state = defaultName, action) => {
        switch (action.type) {
            case 'NEW_GOOGLE_DRIVE_DIAGRAM':
            case 'NEW_LOCAL_STORAGE_DIAGRAM':
                return defaultName

            case 'SAVE_AS_GOOGLE_DRIVE_DIAGRAM':
            case 'SAVE_AS_LOCAL_STORAGE_DIAGRAM':
            case 'GETTING_DIAGRAM_NAME_SUCCEEDED':
            case 'RENAME_DIAGRAM':
                return action.diagramName

            default:
                return state
        }
    };

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var lib = {};

    var actions = {};

    Object.defineProperty(actions, "__esModule", {
      value: true
    });
    actions.ActionCreators = actions.ActionTypes = void 0;
    var ActionTypes = {
      UNDO: '@@redux-undo/UNDO',
      REDO: '@@redux-undo/REDO',
      JUMP_TO_FUTURE: '@@redux-undo/JUMP_TO_FUTURE',
      JUMP_TO_PAST: '@@redux-undo/JUMP_TO_PAST',
      JUMP: '@@redux-undo/JUMP',
      CLEAR_HISTORY: '@@redux-undo/CLEAR_HISTORY'
    };
    actions.ActionTypes = ActionTypes;
    var ActionCreators = {
      undo: function undo() {
        return {
          type: ActionTypes.UNDO
        };
      },
      redo: function redo() {
        return {
          type: ActionTypes.REDO
        };
      },
      jumpToFuture: function jumpToFuture(index) {
        return {
          type: ActionTypes.JUMP_TO_FUTURE,
          index: index
        };
      },
      jumpToPast: function jumpToPast(index) {
        return {
          type: ActionTypes.JUMP_TO_PAST,
          index: index
        };
      },
      jump: function jump(index) {
        return {
          type: ActionTypes.JUMP,
          index: index
        };
      },
      clearHistory: function clearHistory() {
        return {
          type: ActionTypes.CLEAR_HISTORY
        };
      }
    };
    actions.ActionCreators = ActionCreators;

    var helpers = {};

    Object.defineProperty(helpers, "__esModule", {
      value: true
    });
    helpers.parseActions = parseActions;
    helpers.isHistory = isHistory;
    helpers.includeAction = includeAction;
    helpers.excludeAction = excludeAction;
    helpers.combineFilters = combineFilters;
    helpers.groupByActionTypes = groupByActionTypes;
    helpers.newHistory = newHistory;

    // parseActions helper: takes a string (or array)
    //                      and makes it an array if it isn't yet
    function parseActions(rawActions) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (Array.isArray(rawActions)) {
        return rawActions;
      } else if (typeof rawActions === 'string') {
        return [rawActions];
      }

      return defaultValue;
    } // isHistory helper: check for a valid history object


    function isHistory(history) {
      return typeof history.present !== 'undefined' && typeof history.future !== 'undefined' && typeof history.past !== 'undefined' && Array.isArray(history.future) && Array.isArray(history.past);
    } // includeAction helper: whitelist actions to be added to the history


    function includeAction(rawActions) {
      var actions = parseActions(rawActions);
      return function (action) {
        return actions.indexOf(action.type) >= 0;
      };
    } // excludeAction helper: blacklist actions from being added to the history


    function excludeAction(rawActions) {
      var actions = parseActions(rawActions);
      return function (action) {
        return actions.indexOf(action.type) < 0;
      };
    } // combineFilters helper: combine multiple filters to one


    function combineFilters() {
      for (var _len = arguments.length, filters = new Array(_len), _key = 0; _key < _len; _key++) {
        filters[_key] = arguments[_key];
      }

      return filters.reduce(function (prev, curr) {
        return function (action, currentState, previousHistory) {
          return prev(action, currentState, previousHistory) && curr(action, currentState, previousHistory);
        };
      }, function () {
        return true;
      });
    }

    function groupByActionTypes(rawActions) {
      var actions = parseActions(rawActions);
      return function (action) {
        return actions.indexOf(action.type) >= 0 ? action.type : null;
      };
    }

    function newHistory(past, present, future) {
      var group = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return {
        past: past,
        present: present,
        future: future,
        group: group,
        _latestUnfiltered: present,
        index: past.length,
        limit: past.length + future.length + 1
      };
    }

    var reducer = {};

    var debug = {};

    Object.defineProperty(debug, "__esModule", {
      value: true
    });
    debug.set = set;
    debug.start = start;
    debug.end = end;
    debug.log = log;

    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

    function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

    function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

    var __DEBUG__;

    var displayBuffer;
    var colors = {
      prevState: '#9E9E9E',
      action: '#03A9F4',
      nextState: '#4CAF50'
    };
    /* istanbul ignore next: debug messaging is not tested */

    function initBuffer() {
      displayBuffer = {
        header: [],
        prev: [],
        action: [],
        next: [],
        msgs: []
      };
    }
    /* istanbul ignore next: debug messaging is not tested */


    function printBuffer() {
      var _displayBuffer = displayBuffer,
          header = _displayBuffer.header,
          prev = _displayBuffer.prev,
          next = _displayBuffer.next,
          action = _displayBuffer.action,
          msgs = _displayBuffer.msgs;

      if (console.group) {
        var _console, _console2, _console3, _console4, _console5;

        (_console = console).groupCollapsed.apply(_console, _toConsumableArray(header));

        (_console2 = console).log.apply(_console2, _toConsumableArray(prev));

        (_console3 = console).log.apply(_console3, _toConsumableArray(action));

        (_console4 = console).log.apply(_console4, _toConsumableArray(next));

        (_console5 = console).log.apply(_console5, _toConsumableArray(msgs));

        console.groupEnd();
      } else {
        var _console6, _console7, _console8, _console9, _console10;

        (_console6 = console).log.apply(_console6, _toConsumableArray(header));

        (_console7 = console).log.apply(_console7, _toConsumableArray(prev));

        (_console8 = console).log.apply(_console8, _toConsumableArray(action));

        (_console9 = console).log.apply(_console9, _toConsumableArray(next));

        (_console10 = console).log.apply(_console10, _toConsumableArray(msgs));
      }
    }
    /* istanbul ignore next: debug messaging is not tested */


    function colorFormat(text, color, obj) {
      return ["%c".concat(text), "color: ".concat(color, "; font-weight: bold"), obj];
    }
    /* istanbul ignore next: debug messaging is not tested */


    function start(action, state) {
      initBuffer();

      if (__DEBUG__) {
        if (console.group) {
          displayBuffer.header = ['%credux-undo', 'font-style: italic', 'action', action.type];
          displayBuffer.action = colorFormat('action', colors.action, action);
          displayBuffer.prev = colorFormat('prev history', colors.prevState, state);
        } else {
          displayBuffer.header = ['redux-undo action', action.type];
          displayBuffer.action = ['action', action];
          displayBuffer.prev = ['prev history', state];
        }
      }
    }
    /* istanbul ignore next: debug messaging is not tested */


    function end(nextState) {
      if (__DEBUG__) {
        if (console.group) {
          displayBuffer.next = colorFormat('next history', colors.nextState, nextState);
        } else {
          displayBuffer.next = ['next history', nextState];
        }

        printBuffer();
      }
    }
    /* istanbul ignore next: debug messaging is not tested */


    function log() {
      if (__DEBUG__) {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        displayBuffer.msgs = displayBuffer.msgs.concat([].concat(args, ['\n']));
      }
    }
    /* istanbul ignore next: debug messaging is not tested */


    function set(debug) {
      __DEBUG__ = debug;
    }

    (function (exports) {

    	function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	exports["default"] = undoable;

    	var debug$1 = _interopRequireWildcard(debug);

    	var _actions = actions;

    	var _helpers = helpers;

    	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

    	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

    	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

    	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    	function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

    	function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

    	function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

    	function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

    	function createHistory(state, ignoreInitialState) {
    	  // ignoreInitialState essentially prevents the user from undoing to the
    	  // beginning, in the case that the undoable reducer handles initialization
    	  // in a way that can't be redone simply
    	  var history = (0, _helpers.newHistory)([], state, []);

    	  if (ignoreInitialState) {
    	    history._latestUnfiltered = null;
    	  }

    	  return history;
    	} // insert: insert `state` into history, which means adding the current state
    	//         into `past`, setting the new `state` as `present` and erasing
    	//         the `future`.


    	function insert(history, state, limit, group) {
    	  var lengthWithoutFuture = history.past.length + 1;
    	  debug$1.log('inserting', state);
    	  debug$1.log('new free: ', limit - lengthWithoutFuture);
    	  var past = history.past,
    	      _latestUnfiltered = history._latestUnfiltered;
    	  var isHistoryOverflow = limit && limit <= lengthWithoutFuture;
    	  var pastSliced = past.slice(isHistoryOverflow ? 1 : 0);
    	  var newPast = _latestUnfiltered != null ? [].concat(_toConsumableArray(pastSliced), [_latestUnfiltered]) : pastSliced;
    	  return (0, _helpers.newHistory)(newPast, state, [], group);
    	} // jumpToFuture: jump to requested index in future history


    	function jumpToFuture(history, index) {
    	  if (index < 0 || index >= history.future.length) return history;
    	  var past = history.past,
    	      future = history.future,
    	      _latestUnfiltered = history._latestUnfiltered;
    	  var newPast = [].concat(_toConsumableArray(past), [_latestUnfiltered], _toConsumableArray(future.slice(0, index)));
    	  var newPresent = future[index];
    	  var newFuture = future.slice(index + 1);
    	  return (0, _helpers.newHistory)(newPast, newPresent, newFuture);
    	} // jumpToPast: jump to requested index in past history


    	function jumpToPast(history, index) {
    	  if (index < 0 || index >= history.past.length) return history;
    	  var past = history.past,
    	      future = history.future,
    	      _latestUnfiltered = history._latestUnfiltered;
    	  var newPast = past.slice(0, index);
    	  var newFuture = [].concat(_toConsumableArray(past.slice(index + 1)), [_latestUnfiltered], _toConsumableArray(future));
    	  var newPresent = past[index];
    	  return (0, _helpers.newHistory)(newPast, newPresent, newFuture);
    	} // jump: jump n steps in the past or forward


    	function jump(history, n) {
    	  if (n > 0) return jumpToFuture(history, n - 1);
    	  if (n < 0) return jumpToPast(history, history.past.length + n);
    	  return history;
    	} // helper to dynamically match in the reducer's switch-case


    	function actionTypeAmongClearHistoryType(actionType, clearHistoryType) {
    	  return clearHistoryType.indexOf(actionType) > -1 ? actionType : !actionType;
    	} // redux-undo higher order reducer


    	function undoable(reducer) {
    	  var rawConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    	  debug$1.set(rawConfig.debug);

    	  var config = _objectSpread({
    	    limit: undefined,
    	    filter: function filter() {
    	      return true;
    	    },
    	    groupBy: function groupBy() {
    	      return null;
    	    },
    	    undoType: _actions.ActionTypes.UNDO,
    	    redoType: _actions.ActionTypes.REDO,
    	    jumpToPastType: _actions.ActionTypes.JUMP_TO_PAST,
    	    jumpToFutureType: _actions.ActionTypes.JUMP_TO_FUTURE,
    	    jumpType: _actions.ActionTypes.JUMP,
    	    neverSkipReducer: false,
    	    ignoreInitialState: false,
    	    syncFilter: false
    	  }, rawConfig, {
    	    initTypes: (0, _helpers.parseActions)(rawConfig.initTypes, ['@@redux-undo/INIT']),
    	    clearHistoryType: (0, _helpers.parseActions)(rawConfig.clearHistoryType, [_actions.ActionTypes.CLEAR_HISTORY])
    	  }); // Allows the user to call the reducer with redux-undo specific actions


    	  var skipReducer = config.neverSkipReducer ? function (res, action) {
    	    for (var _len = arguments.length, slices = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    	      slices[_key - 2] = arguments[_key];
    	    }

    	    return _objectSpread({}, res, {
    	      present: reducer.apply(void 0, [res.present, action].concat(slices))
    	    });
    	  } : function (res) {
    	    return res;
    	  };
    	  var initialState;
    	  return function () {
    	    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    	    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    	    debug$1.start(action, state);
    	    var history = state;

    	    for (var _len2 = arguments.length, slices = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    	      slices[_key2 - 2] = arguments[_key2];
    	    }

    	    if (!initialState) {
    	      debug$1.log('history is uninitialized');

    	      if (state === undefined) {
    	        var createHistoryAction = {
    	          type: '@@redux-undo/CREATE_HISTORY'
    	        };
    	        var start = reducer.apply(void 0, [state, createHistoryAction].concat(slices));
    	        history = createHistory(start, config.ignoreInitialState);
    	        debug$1.log('do not set initialState on probe actions');
    	        debug$1.end(history);
    	        return history;
    	      } else if ((0, _helpers.isHistory)(state)) {
    	        history = initialState = config.ignoreInitialState ? state : (0, _helpers.newHistory)(state.past, state.present, state.future);
    	        debug$1.log('initialHistory initialized: initialState is a history', initialState);
    	      } else {
    	        history = initialState = createHistory(state, config.ignoreInitialState);
    	        debug$1.log('initialHistory initialized: initialState is not a history', initialState);
    	      }
    	    }

    	    var res;

    	    switch (action.type) {
    	      case undefined:
    	        return history;

    	      case config.undoType:
    	        res = jump(history, -1);
    	        debug$1.log('perform undo');
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      case config.redoType:
    	        res = jump(history, 1);
    	        debug$1.log('perform redo');
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      case config.jumpToPastType:
    	        res = jumpToPast(history, action.index);
    	        debug$1.log("perform jumpToPast to ".concat(action.index));
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      case config.jumpToFutureType:
    	        res = jumpToFuture(history, action.index);
    	        debug$1.log("perform jumpToFuture to ".concat(action.index));
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      case config.jumpType:
    	        res = jump(history, action.index);
    	        debug$1.log("perform jump to ".concat(action.index));
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      case actionTypeAmongClearHistoryType(action.type, config.clearHistoryType):
    	        res = createHistory(history.present, config.ignoreInitialState);
    	        debug$1.log('perform clearHistory');
    	        debug$1.end(res);
    	        return skipReducer.apply(void 0, [res, action].concat(slices));

    	      default:
    	        res = reducer.apply(void 0, [history.present, action].concat(slices));

    	        if (config.initTypes.some(function (actionType) {
    	          return actionType === action.type;
    	        })) {
    	          debug$1.log('reset history due to init action');
    	          debug$1.end(initialState);
    	          return initialState;
    	        }

    	        if (history._latestUnfiltered === res) {
    	          // Don't handle this action. Do not call debug.end here,
    	          // because this action should not produce side effects to the console
    	          return history;
    	        }
    	        /* eslint-disable-next-line no-case-declarations */


    	        var filtered = typeof config.filter === 'function' && !config.filter(action, res, history);

    	        if (filtered) {
    	          // if filtering an action, merely update the present
    	          var filteredState = (0, _helpers.newHistory)(history.past, res, history.future, history.group);

    	          if (!config.syncFilter) {
    	            filteredState._latestUnfiltered = history._latestUnfiltered;
    	          }

    	          debug$1.log('filter ignored action, not storing it in past');
    	          debug$1.end(filteredState);
    	          return filteredState;
    	        }
    	        /* eslint-disable-next-line no-case-declarations */


    	        var group = config.groupBy(action, res, history);

    	        if (group != null && group === history.group) {
    	          // if grouping with the previous action, only update the present
    	          var groupedState = (0, _helpers.newHistory)(history.past, res, history.future, history.group);
    	          debug$1.log('groupBy grouped the action with the previous action');
    	          debug$1.end(groupedState);
    	          return groupedState;
    	        } // If the action wasn't filtered or grouped, insert normally


    	        history = insert(history, res, config.limit, group);
    	        debug$1.log('inserted new state into history');
    	        debug$1.end(history);
    	        return history;
    	    }
    	  };
    	}
    } (reducer));

    (function (exports) {

    	Object.defineProperty(exports, "__esModule", {
    	  value: true
    	});
    	Object.defineProperty(exports, "ActionTypes", {
    	  enumerable: true,
    	  get: function get() {
    	    return _actions.ActionTypes;
    	  }
    	});
    	Object.defineProperty(exports, "ActionCreators", {
    	  enumerable: true,
    	  get: function get() {
    	    return _actions.ActionCreators;
    	  }
    	});
    	Object.defineProperty(exports, "parseActions", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.parseActions;
    	  }
    	});
    	Object.defineProperty(exports, "isHistory", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.isHistory;
    	  }
    	});
    	Object.defineProperty(exports, "includeAction", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.includeAction;
    	  }
    	});
    	Object.defineProperty(exports, "excludeAction", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.excludeAction;
    	  }
    	});
    	Object.defineProperty(exports, "combineFilters", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.combineFilters;
    	  }
    	});
    	Object.defineProperty(exports, "groupByActionTypes", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.groupByActionTypes;
    	  }
    	});
    	Object.defineProperty(exports, "newHistory", {
    	  enumerable: true,
    	  get: function get() {
    	    return _helpers.newHistory;
    	  }
    	});
    	Object.defineProperty(exports, "default", {
    	  enumerable: true,
    	  get: function get() {
    	    return _reducer["default"];
    	  }
    	});

    	var _actions = actions;

    	var _helpers = helpers;

    	var _reducer = _interopRequireDefault(reducer);

    	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
    } (lib));

    var undoable = /*@__PURE__*/getDefaultExportFromCjs(lib);

    const graph = (state = emptyGraph(), action) => {
        switch (action.type) {
            case 'NEW_GOOGLE_DRIVE_DIAGRAM':
            case 'NEW_LOCAL_STORAGE_DIAGRAM':
                return emptyGraph()

            case 'CREATE_NODE':
                {
                    const newNodes = state.nodes.slice();
                    newNodes.push({
                        id: action.newNodeId,
                        position: action.newNodePosition,
                        caption: action.caption,
                        style: action.style,
                        labels: [],
                        properties: {}
                    });
                    return {
                        style: state.style,
                        nodes: newNodes,
                        relationships: state.relationships
                    }
                }

            case 'CREATE_NODES_AND_RELATIONSHIPS':
                {
                    const newNodes = [...state.nodes, ...action.targetNodeIds.map((targetNodeId, i) => {
                        return {
                            id: targetNodeId,
                            position: action.targetNodePositions[i],
                            caption: action.caption,
                            style: action.style,
                            labels: [],
                            properties: {}
                        }
                    })];
                    const newRelationships = [...state.relationships, ...action.newRelationshipIds.map((newRelationshipId, i) => {
                        return {
                            id: newRelationshipId,
                            type: '',
                            style: {},
                            properties: {},
                            fromId: action.sourceNodeIds[i],
                            toId: action.targetNodeIds[i]
                        }
                    })];

                    return {
                        style: state.style,
                        nodes: newNodes,
                        relationships: newRelationships
                    }
                }

            case 'CONNECT_NODES':
                {
                    const newRelationships = [...state.relationships, ...action.newRelationshipIds.map((newRelationshipId, i) => {
                        return {
                            id: newRelationshipId,
                            type: '',
                            style: {},
                            properties: {},
                            fromId: action.sourceNodeIds[i],
                            toId: action.targetNodeIds[i]
                        }
                    })];
                    return {
                        style: state.style,
                        nodes: state.nodes,
                        relationships: newRelationships
                    }
                }

            case 'SET_NODE_CAPTION':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? setCaption(node, action.caption) : node),
                        relationships: state.relationships
                    }
                }

            case 'ADD_LABEL':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? addLabel(node, action.label) : node),
                        relationships: state.relationships
                    }
                }

            case 'ADD_LABELS':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => action.nodeLabels.hasOwnProperty(node.id) ? addLabel(node, action.nodeLabels[node.id]) : node),
                        relationships: state.relationships
                    }
                }

            case 'RENAME_LABEL':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? renameLabel(node, action.oldLabel, action.newLabel) : node),
                        relationships: state.relationships
                    }
                }

            case 'REMOVE_LABEL':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? removeLabel(node, action.label) : node),
                        relationships: state.relationships
                    }
                }

            case 'MERGE_NODES':
                {
                    const nodeIdMap = new Map();
                    for (const spec of action.mergeSpecs) {
                        for (const purgedNodeId of spec.purgedNodeIds) {
                            nodeIdMap.set(purgedNodeId, spec.survivingNodeId);
                        }
                    }
                    const translateNodeId = (nodeId) => nodeIdMap.has(nodeId) ? nodeIdMap.get(nodeId) : nodeId;
                    return {
                        style: state.style,
                        nodes: state.nodes
                            .filter(node => {
                                return !action.mergeSpecs.some(spec => spec.purgedNodeIds.includes(node.id))
                            })
                            .map(node => {
                                const spec = action.mergeSpecs.find(spec => spec.survivingNodeId === node.id);
                                if (spec) {
                                    let mergedProperties = node.properties;
                                    for (const purgedNodeId of spec.purgedNodeIds) {
                                        const purgedNode = state.nodes.find(node => node.id === purgedNodeId);
                                        mergedProperties = { ...mergedProperties,
                                            ...purgedNode.properties
                                        };
                                    }
                                    return {
                                        ...node,
                                        properties: mergedProperties,
                                        position: spec.position
                                    }
                                } else {
                                    return node
                                }
                            }),
                        relationships: state.relationships
                            .map(relationship => {
                                return {
                                    ...relationship,
                                    fromId: translateNodeId(relationship.fromId),
                                    toId: translateNodeId(relationship.toId),
                                }
                            })
                    }
                }

            case 'RENAME_PROPERTY':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? renameProperty(node, action.oldPropertyKey, action.newPropertyKey) : node),
                        relationships: state.relationships.map((relationship) => relationshipSelected(action.selection, relationship.id) ? renameProperty(relationship, action.oldPropertyKey, action.newPropertyKey) : relationship)
                    }
                }

            case 'SET_PROPERTY':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? setProperty(node, action.key, action.value) : node),
                        relationships: state.relationships.map((relationship) => relationshipSelected(action.selection, relationship.id) ? setProperty(relationship, action.key, action.value) : relationship)
                    }
                }

            case 'SET_PROPERTY_VALUES':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => action.nodePropertyValues.hasOwnProperty(node.id) ? setProperty(node, action.key, action.nodePropertyValues[node.id]) : node),
                        relationships: state.relationships
                    }
                }

            case 'SET_ARROWS_PROPERTY':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) =>
                            nodeStyleAttributes.includes(action.key) && nodeSelected(action.selection, node.id) ?
                            setArrowsProperty(node, action.key, action.value) :
                            node),
                        relationships: state.relationships.map((relationship) =>
                            relationshipStyleAttributes.includes(action.key) && relationshipSelected(action.selection, relationship.id) ?
                            setArrowsProperty(relationship, action.key, action.value) :
                            relationship)
                    }
                }

            case 'REMOVE_PROPERTY':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? removeProperty(node, action.key) : node),
                        relationships: state.relationships.map((relationship) => relationshipSelected(action.selection, relationship.id) ? removeProperty(relationship, action.key) : relationship)
                    }
                }

            case 'REMOVE_ARROWS_PROPERTY':
                {
                    return {
                        style: state.style,
                        nodes: state.nodes.map((node) => nodeSelected(action.selection, node.id) ? removeArrowsProperty(node, action.key) : node),
                        relationships: state.relationships.map((relationship) => relationshipSelected(action.selection, relationship.id) ? removeArrowsProperty(relationship, action.key) : relationship)
                    }
                }

            case 'SET_GRAPH_STYLE':
                {
                    const graphStyle = { ...state.style
                    };
                    graphStyle[action.key] = action.value;
                    return {
                        style: graphStyle,
                        nodes: state.nodes,
                        relationships: state.relationships
                    }
                }

            case 'SET_GRAPH_STYLES':
                {
                    const graphStyle = { ...state.style
                    };
                    for (const [key, value] of Object.entries(action.style)) {
                        graphStyle[key] = value;
                    }
                    return {
                        style: graphStyle,
                        nodes: state.nodes,
                        relationships: state.relationships
                    }
                }

            case 'MOVE_NODES':
            case 'MOVE_NODES_END_DRAG':
                const nodeIdToNode = {};
                let clean = true;
                state.nodes.forEach((node) => {
                    nodeIdToNode[node.id] = node;
                });
                action.nodePositions.forEach((nodePosition) => {
                    if (nodeIdToNode[nodePosition.nodeId]) {
                        const oldNode = nodeIdToNode[nodePosition.nodeId];
                        clean &= oldNode.position.isEqual(nodePosition.position);
                        nodeIdToNode[nodePosition.nodeId] = moveTo(oldNode, nodePosition.position);
                    }
                });

                if (clean) return state

                return {
                    style: state.style,
                    nodes: Object.values(nodeIdToNode),
                    relationships: state.relationships
                }

            case 'SET_RELATIONSHIP_TYPE':
                return {
                    style: state.style,
                    nodes: state.nodes,
                    relationships: state.relationships.map(relationship => relationshipSelected(action.selection, relationship.id) ? setType(relationship, action.relationshipType) : relationship)
                }

            case 'DUPLICATE_NODES_AND_RELATIONSHIPS':
                {
                    const newNodes = state.nodes.slice();
                    Object.keys(action.nodeIdMap).forEach(newNodeId => {
                        const spec = action.nodeIdMap[newNodeId];
                        const oldNode = state.nodes.find(n => idsMatch(n.id, spec.oldNodeId));
                        const newNode = {
                            id: newNodeId,
                            position: spec.position,
                            caption: oldNode.caption,
                            style: { ...oldNode.style
                            },
                            labels: [...oldNode.labels],
                            properties: { ...oldNode.properties
                            }
                        };
                        newNodes.push(newNode);
                    });

                    const newRelationships = state.relationships.slice();
                    Object.keys(action.relationshipIdMap).forEach(newRelationshipId => {
                        const spec = action.relationshipIdMap[newRelationshipId];
                        const oldRelationship = state.relationships.find(r => idsMatch(r.id, spec.oldRelationshipId));
                        const newRelationship = {
                            id: newRelationshipId,
                            type: oldRelationship.type,
                            fromId: spec.fromId,
                            toId: spec.toId,
                            style: { ...oldRelationship.style
                            },
                            properties: { ...oldRelationship.properties
                            }
                        };
                        newRelationships.push(newRelationship);
                    });

                    return {
                        style: state.style,
                        nodes: newNodes,
                        relationships: newRelationships
                    }
                }

            case 'IMPORT_NODES_AND_RELATIONSHIPS':
                {
                    const newNodes = [...state.nodes, ...action.nodes];
                    const newRelationships = [...state.relationships, ...action.relationships];

                    return {
                        style: state.style,
                        nodes: newNodes,
                        relationships: newRelationships
                    }
                }

            case 'DELETE_NODES_AND_RELATIONSHIPS':
                return {
                    style: state.style,
                    nodes: state.nodes.filter(node => !action.nodeIdMap[node.id]),
                    relationships: state.relationships.filter(relationship => !action.relationshipIdMap[relationship.id])
                }

            case 'REVERSE_RELATIONSHIPS':
                return {
                    ...state,
                    relationships: state.relationships.map(relationship => relationshipSelected(action.selection, relationship.id) ? reverse(relationship) : relationship)
                }

            case 'INLINE_RELATIONSHIPS':
                return {
                    ...state,
                    nodes: state.nodes
                        .filter(node => !action.relationshipSpecs.some(spec => spec.removeNodeId === node.id))
                        .map(node => {
                            const spec = action.relationshipSpecs.find(spec => spec.addPropertiesNodeId === node.id);
                            if (spec) {
                                let augmentedNode = node;
                                for (const label of spec.labels) {
                                    augmentedNode = addLabel(augmentedNode, label);
                                }
                                for (const [key, value] of Object.entries(spec.properties)) {
                                    augmentedNode = setProperty(augmentedNode, key, value);
                                }
                                return augmentedNode
                            } else {
                                return node
                            }
                        }),
                    relationships: state.relationships
                        .filter(relationship => !action.relationshipSpecs.some(spec =>
                            spec.removeNodeId === relationship.fromId ||
                            spec.removeNodeId === relationship.toId
                        ))
                }

            case 'GETTING_GRAPH_SUCCEEDED':
                return action.storedGraph

            default:
                return state
        }
    };

    var graph$1 = undoable(graph, {
        filter: action => action.category === 'GRAPH',
        groupBy: lib.groupByActionTypes('MOVE_NODES')
    });

    const allEntitiesSelected = (oldEntities, newEntities) => {
        return newEntities.every(newEntity =>
            oldEntities.some(oldEntity =>
                entitiesMatch(oldEntity, newEntity)
            )
        )
    };

    const entitiesMatch = (entity1, entity2) => (
        entity1.entityType === entity2.entityType &&
        entity1.id === entity2.id
    );

    const toggleEntities = (oldEntities, newEntities, mode) => {
        if (mode === 'at-least' && allEntitiesSelected(oldEntities, newEntities)) {
            return oldEntities
        }

        switch (mode) {
            case 'xor':
                return oldEntities
                    .filter(oldEntity => {
                        return !newEntities.some(newEntity =>
                            entitiesMatch(oldEntity, newEntity)
                        )
                    }).concat(newEntities.filter(newEntity => {
                        return !oldEntities.some(oldEntity =>
                            entitiesMatch(oldEntity, newEntity)
                        )
                    }))
            case 'or':
                return oldEntities
                    .concat(newEntities.filter(newEntity => {
                        return !oldEntities.some(oldEntity =>
                            entitiesMatch(oldEntity, newEntity)
                        )
                    }))

            case 'replace':
            case 'at-least':
                return newEntities
        }
    };

    function selection(state = {
        editing: undefined,
        entities: []
    }, action) {
        switch (action.type) {
            case 'ACTIVATE_EDITING':
                return {
                    editing: action.editing,
                    entities: toggleEntities(state.entities, [action.editing], 'at-least')
                }

            case 'DEACTIVATE_EDITING':
                return {
                    editing: undefined,
                    entities: state.entities
                }

            case 'TOGGLE_SELECTION':
                const entities = toggleEntities(state.entities, action.entities, action.mode);
                let editing = undefined;
                if (state.editing && entities.some(selectedEntity => entitiesMatch(selectedEntity, state.editing))) {
                    editing = state.editing;
                }
                return {
                    editing,
                    entities
                }

            case 'CLEAR_SELECTION':
            case 'DELETE_NODES_AND_RELATIONSHIPS':
            case lib.ActionTypes.UNDO:
            case lib.ActionTypes.REDO:
                return {
                    editing: undefined,
                    entities: []
                }
            case 'CREATE_NODE':
                {
                    return {
                        editing: undefined,
                        entities: [{
                            entityType: 'node',
                            id: action.newNodeId
                        }]
                    }
                }
            case 'CREATE_NODES_AND_RELATIONSHIPS':
                {
                    return {
                        editing: undefined,
                        entities: action.targetNodeIds.map(targetNodeId => ({
                            entityType: 'node',
                            id: targetNodeId
                        }))
                    }
                }
            case 'CONNECT_NODES':
                {
                    return {
                        editing: undefined,
                        entities: action.newRelationshipIds.map(newRelationshipId => ({
                            entityType: 'relationship',
                            id: newRelationshipId
                        }))
                    }
                }
            case 'DUPLICATE_NODES_AND_RELATIONSHIPS':
                return {
                    editing: undefined,
                    entities: [
                        ...Object.keys(action.nodeIdMap).map(nodeId => ({
                            entityType: 'node',
                            id: nodeId
                        })),
                        ...Object.keys(action.relationshipIdMap).map(relId => ({
                            entityType: 'relationship',
                            id: relId
                        }))
                    ]
                }
            case 'MERGE_NODES':
                return {
                    editing: undefined,
                    entities: action.mergeSpecs.map(spec => ({
                        entityType: 'node',
                        id: spec.survivingNodeId
                    }))
                }
            case 'INLINE_RELATIONSHIPS':
                return {
                    editing: undefined,
                    entities: action.relationshipSpecs.map(spec => ({
                        entityType: 'node',
                        id: spec.addPropertiesNodeId
                    }))
                }
            case 'IMPORT_NODES_AND_RELATIONSHIPS':
                return {
                    editing: undefined,
                    entities: [
                        ...action.nodes.map(node => ({
                            entityType: 'node',
                            id: node.id
                        })),
                        ...action.relationships.map(relationship => ({
                            entityType: 'relationship',
                            id: relationship.id
                        }))
                    ]
                }
            default:
                return state
        }
    }

    const mouse = (state = {
        dragType: 'NONE'
    }, action) => {
        switch (action.type) {
            case 'MOUSE_DOWN_ON_HANDLE':
                {
                    return {
                        dragType: 'HANDLE',
                        corner: action.corner,
                        mousePosition: action.canvasPosition,
                        initialMousePosition: action.canvasPosition,
                        initialNodePositions: action.nodePositions
                    }
                }

            case 'LOCK_HANDLE_DRAG_MODE':
                {
                    return {
                        ...state,
                        dragType: action.dragType
                    }
                }

            case 'MOUSE_DOWN_ON_NODE':
                {
                    const mouseToNodeVector = action.node.position.vectorFrom(action.graphPosition);
                    return {
                        dragType: 'NODE',
                        node: action.node,
                        mousePosition: action.position,
                        mouseToNodeVector
                    }
                }

            case 'MOUSE_DOWN_ON_NODE_RING':
                {
                    return {
                        dragType: 'NODE_RING',
                        node: action.node,
                        mousePosition: action.position
                    }
                }

            case 'MOUSE_DOWN_ON_CANVAS':
                {
                    return {
                        dragType: 'CANVAS',
                        dragged: false,
                        mousePosition: action.canvasPosition,
                        mouseDownPosition: action.graphPosition
                    }
                }

            case 'MOVE_NODES':
                const currentPosition = action.newMousePosition || state.mousePosition;
                return {
                    ...state,
                    dragged: true,
                    mousePosition: currentPosition
                }

            case 'RING_DRAGGED':
                return {
                    ...state,
                    dragged: true,
                    mousePosition: action.newMousePosition
                }

            case 'SET_MARQUEE':
                return {
                    ...state,
                    dragType: 'MARQUEE',
                    dragged: true,
                    mousePosition: action.newMousePosition
                }

            case 'END_DRAG':
                return {
                    dragType: 'NONE'
                }

            default:
                return state
        }
    };

    class Guides {
        constructor(guidelines = [], naturalPosition, naturalRadius) {
            this.guidelines = guidelines;
            this.naturalPosition = naturalPosition;
            this.naturalRadius = naturalRadius;
        }
    }

    function guides(state = new Guides(), action) {
        switch (action.type) {
            case 'MOVE_NODES':
            case 'RING_DRAGGED':
                return action.guides

            case 'END_DRAG':
                return new Guides()

            default:
                return state
        }
    }

    class Size {
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }

        relative(dWidth, dHeight) {
            return new Size(this.width + dWidth, this.height + dHeight)
        }
    }

    const applicationLayout = (state = {
        windowSize: new Size(window.innerWidth, window.innerHeight),
        inspectorVisible: true,
        styleMode: 'theme',
        betaFeaturesEnabled: false,
        layers: []
    }, action) => {
        switch (action.type) {
            case 'WINDOW_RESIZED':
                return {
                    ...state,
                    windowSize: new Size(action.width, action.height)
                }

            case 'TOGGLE_INSPECTOR':
                return {
                    ...state,
                    inspectorVisible: !state.inspectorVisible
                }

            case 'STYLE_THEME':
                return {
                    ...state,
                    styleMode: 'theme'
                }

            case 'STYLE_CUSTOMIZE':
                return {
                    ...state,
                    styleMode: 'customize'
                }

            case 'SET_BETA_FEATURES_ENABLED':
                return {
                    ...state,
                    layers: [],
                    betaFeaturesEnabled: action.enabled
                }
            case 'SET_PERSIST_CLUSTERS':
                const clusterLayer = state.layers.find(layer => layer.name === 'gangs');
                if (clusterLayer && clusterLayer.persist !== action.enabled) {
                    const otherLayers = state.layers.filter(layer => layer.name !== 'gangs');
                    return {
                        ...state,
                        layers: otherLayers.concat([{
                            ...clusterLayer,
                            persist: action.enabled
                        }])
                    }
                } else {
                    return state
                }
            default:
                return state
        }
    };

    class ViewTransformation {
        constructor(scale = 1, offset = new Vector(0, 0)) {
            this.scale = scale;
            this.offset = offset;
        }

        zoom(scale) {
            return new ViewTransformastion(scale, this.offset)
        }

        scroll(vector) {
            return new ViewTransformation(this.scale, this.offset.plus(vector))
        }

        transform(point) {
            return point.scale(this.scale).translate(this.offset)
        }

        inverse(point) {
            return point.translate(this.offset.invert()).scale(1 / this.scale)
        }

        adjust(scale, panX, panY) {
            return new ViewTransformation(scale, new Vector(panX, panY))
        }

        asCSSTransform() {
            return `${this.offset.asCSSTransform()} scale(${this.scale})`
        }
    }

    const viewTransformation = (state = new ViewTransformation(), action) => {
        switch (action.type) {
            case 'SCROLL':
                return state.scroll(action.vector)

            case 'ADJUST_VIEWPORT':
                return state.adjust(action.scale, action.panX, action.panY)
            default:
                return state
        }
    };

    function dragging(state = {
        sourceNodeId: null,
        secondarySourceNodeIds: [],
        targetNodeIds: [],
        newNodePosition: null
    }, action) {
        switch (action.type) {
            case 'ACTIVATE_RING':
                return {
                    sourceNodeId: action.sourceNodeId,
                    secondarySourceNodeIds: [],
                    nodeType: action.nodeType,
                    targetNodeIds: [],
                    newNodePosition: null
                }
            case 'RING_DRAGGED':
                return {
                    sourceNodeId: action.sourceNodeId,
                    secondarySourceNodeIds: action.secondarySourceNodeIds,
                    targetNodeIds: action.targetNodeIds,
                    newNodePosition: action.position
                }
            case 'DEACTIVATE_RING':
            case 'END_DRAG':
                return {
                    sourceNodeId: null,
                    secondarySourceNodeIds: [],
                    targetNodeIds: [],
                    newNodePosition: null
                }
            default:
                return state
        }
    }

    function selectionMarquee(state = null, action) {
        switch (action.type) {
            case 'SET_MARQUEE':
                return action.marquee
            case 'END_DRAG':
                return null
            default:
                return state
        }
    }

    const gestures = combineReducers({
        dragToCreate: dragging,
        selectionMarquee
    });

    function actionMemos(state = {}, action) {
        switch (action.type) {
            case 'DUPLICATE_NODES_AND_RELATIONSHIPS':
                return {
                    ...state,
                    lastDuplicateAction: action
                }

            default:
                return state
        }
    }

    const initialState$1 = [];

    var gangs = (state = initialState$1, action) => {
        switch (action.type) {
            case 'CREATE_CLUSTER':
                return state.concat([{
                    id: action.nodeId,
                    position: action.position,
                    caption: action.caption,
                    style: action.style,
                    properties: {},
                    type: action.nodeType,
                    members: action.members,
                    initialPosition: action.initialPosition
                }])
            case 'LOAD_CLUSTERS':
                return action.clusters.map(cluster => ({
                    id: cluster.id,
                    position: cluster.position,
                    caption: cluster.caption,
                    properties: {},
                    type: cluster.type || cluster,
                    members: cluster.members,
                    initialPosition: cluster.initialPosition,
                    style: cluster.style || {
                        'radius': 50,
                        'node-color': '#FFF',
                        'border-width': '2',
                        'caption-color': '#000'
                    }
                }))
            case 'REMOVE_CLUSTER':
                return state.filter(gang => gang.id !== action.nodeId)

            case 'MOVE_NODES':
                const nodeIdToNode = {};
                state.forEach((node) => {
                    nodeIdToNode[node.id] = node;
                });

                action.nodePositions.forEach((nodePosition) => {
                    if (nodeIdToNode[nodePosition.nodeId]) {
                        nodeIdToNode[nodePosition.nodeId] = moveTo(nodeIdToNode[nodePosition.nodeId], nodePosition.position);
                    }
                });

                return [...Object.values(nodeIdToNode)]
            default:
                return state
        }
    };

    const initialState = {
        "storage.GOOGLE_DRIVE": true,
        "storage.LOCAL_STORAGE": true,
        "storage.DATABASE": false,
    };

    var features = (state = initialState, action) => initialState;

    var googleDrive = (state = {}, action) => {
        switch (action.type) {
            case 'GOOGLE_DRIVE_SIGN_IN_STATUS':
                return {
                    apiInitialized: true,
                    signedIn: action.signedIn
                }
            default:
                return state
        }
    };

    function cachedImages(state = {}, action) {
        if (action.type === 'IMAGE_EVENT') {
            return {
                ...state,
                [action.imageUrl]: action.cachedImage
            }
        }

        return state
    }

    const arrowsAppReducers = combineReducers({
        // recentStorage,
        // storage,
        diagramName,
        graph: graph$1,
        selection,
        mouse,
        gestures,
        guides,
        applicationLayout,
        viewTransformation,
        actionMemos,
        // applicationDialogs,
        gangs,
        features,
        googleDrive,
        cachedImages
    });

    class StateController {
        constructor() {
            this.store = createStore(
                arrowsAppReducers,
            );

            this.instance = null;
        }

        getStore() {
            return this.store
        }

        // 单例模式
        static getInstance() {
            if (this.instance) {
                return this.instance
            }

            return this.instance = new StateController()
        }
    }

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

            // 合并配置
            merge(this.options, options);

            this.stateStore = StateController.getInstance().store;


            this.initPointClass(graph);
            // 适配二倍屏
            this.fitCanvasSize(this.canvas, this.options);
            const visualGraph = getVisualGraph(graph, this.selection, '');
            this.options.viewTransformation = calculateViewportTranslation(visualGraph, {width: this.options.width, height: this.options.height});

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
