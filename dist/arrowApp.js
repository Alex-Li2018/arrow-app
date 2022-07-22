(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ArrowApp = factory());
})(this, (function () { 'use strict';

  // Cache implementation based on Erik Rasmussen's `lru-memoize`:
  // https://github.com/erikras/lru-memoize
  var NOT_FOUND = 'NOT_FOUND';

  function createSingletonCache(equals) {
    var entry;
    return {
      get: function get(key) {
        if (entry && equals(entry.key, key)) {
          return entry.value;
        }

        return NOT_FOUND;
      },
      put: function put(key, value) {
        entry = {
          key: key,
          value: value
        };
      },
      getEntries: function getEntries() {
        return entry ? [entry] : [];
      },
      clear: function clear() {
        entry = undefined;
      }
    };
  }

  function createLruCache(maxSize, equals) {
    var entries = [];

    function get(key) {
      var cacheIndex = entries.findIndex(function (entry) {
        return equals(key, entry.key);
      }); // We found a cached entry

      if (cacheIndex > -1) {
        var entry = entries[cacheIndex]; // Cached entry not at top of cache, move it to the top

        if (cacheIndex > 0) {
          entries.splice(cacheIndex, 1);
          entries.unshift(entry);
        }

        return entry.value;
      } // No entry found in cache, return sentinel


      return NOT_FOUND;
    }

    function put(key, value) {
      if (get(key) === NOT_FOUND) {
        // TODO Is unshift slow?
        entries.unshift({
          key: key,
          value: value
        });

        if (entries.length > maxSize) {
          entries.pop();
        }
      }
    }

    function getEntries() {
      return entries;
    }

    function clear() {
      entries = [];
    }

    return {
      get: get,
      put: put,
      getEntries: getEntries,
      clear: clear
    };
  }

  var defaultEqualityCheck = function defaultEqualityCheck(a, b) {
    return a === b;
  };
  function createCacheKeyComparator(equalityCheck) {
    return function areArgumentsShallowlyEqual(prev, next) {
      if (prev === null || next === null || prev.length !== next.length) {
        return false;
      } // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.


      var length = prev.length;

      for (var i = 0; i < length; i++) {
        if (!equalityCheck(prev[i], next[i])) {
          return false;
        }
      }

      return true;
    };
  }
  // defaultMemoize now supports a configurable cache size with LRU behavior,
  // and optional comparison of the result value with existing values
  function defaultMemoize(func, equalityCheckOrOptions) {
    var providedOptions = typeof equalityCheckOrOptions === 'object' ? equalityCheckOrOptions : {
      equalityCheck: equalityCheckOrOptions
    };
    var _providedOptions$equa = providedOptions.equalityCheck,
        equalityCheck = _providedOptions$equa === void 0 ? defaultEqualityCheck : _providedOptions$equa,
        _providedOptions$maxS = providedOptions.maxSize,
        maxSize = _providedOptions$maxS === void 0 ? 1 : _providedOptions$maxS,
        resultEqualityCheck = providedOptions.resultEqualityCheck;
    var comparator = createCacheKeyComparator(equalityCheck);
    var cache = maxSize === 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator); // we reference arguments instead of spreading them for performance reasons

    function memoized() {
      var value = cache.get(arguments);

      if (value === NOT_FOUND) {
        // @ts-ignore
        value = func.apply(null, arguments);

        if (resultEqualityCheck) {
          var entries = cache.getEntries();
          var matchingEntry = entries.find(function (entry) {
            return resultEqualityCheck(entry.value, value);
          });

          if (matchingEntry) {
            value = matchingEntry.value;
          }
        }

        cache.put(arguments, value);
      }

      return value;
    }

    memoized.clearCache = function () {
      return cache.clear();
    };

    return memoized;
  }

  function getDependencies(funcs) {
    var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

    if (!dependencies.every(function (dep) {
      return typeof dep === 'function';
    })) {
      var dependencyTypes = dependencies.map(function (dep) {
        return typeof dep === 'function' ? "function " + (dep.name || 'unnamed') + "()" : typeof dep;
      }).join(', ');
      throw new Error("createSelector expects all input-selectors to be functions, but received the following types: [" + dependencyTypes + "]");
    }

    return dependencies;
  }

  function createSelectorCreator(memoize) {
    for (var _len = arguments.length, memoizeOptionsFromArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      memoizeOptionsFromArgs[_key - 1] = arguments[_key];
    }

    var createSelector = function createSelector() {
      for (var _len2 = arguments.length, funcs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        funcs[_key2] = arguments[_key2];
      }

      var _recomputations = 0;

      var _lastResult; // Due to the intricacies of rest params, we can't do an optional arg after `...funcs`.
      // So, start by declaring the default value here.
      // (And yes, the words 'memoize' and 'options' appear too many times in this next sequence.)


      var directlyPassedOptions = {
        memoizeOptions: undefined
      }; // Normally, the result func or "output selector" is the last arg

      var resultFunc = funcs.pop(); // If the result func is actually an _object_, assume it's our options object

      if (typeof resultFunc === 'object') {
        directlyPassedOptions = resultFunc; // and pop the real result func off

        resultFunc = funcs.pop();
      }

      if (typeof resultFunc !== 'function') {
        throw new Error("createSelector expects an output function after the inputs, but received: [" + typeof resultFunc + "]");
      } // Determine which set of options we're using. Prefer options passed directly,
      // but fall back to options given to createSelectorCreator.


      var _directlyPassedOption = directlyPassedOptions,
          _directlyPassedOption2 = _directlyPassedOption.memoizeOptions,
          memoizeOptions = _directlyPassedOption2 === void 0 ? memoizeOptionsFromArgs : _directlyPassedOption2; // Simplifying assumption: it's unlikely that the first options arg of the provided memoizer
      // is an array. In most libs I've looked at, it's an equality function or options object.
      // Based on that, if `memoizeOptions` _is_ an array, we assume it's a full
      // user-provided array of options. Otherwise, it must be just the _first_ arg, and so
      // we wrap it in an array so we can apply it.

      var finalMemoizeOptions = Array.isArray(memoizeOptions) ? memoizeOptions : [memoizeOptions];
      var dependencies = getDependencies(funcs);
      var memoizedResultFunc = memoize.apply(void 0, [function recomputationWrapper() {
        _recomputations++; // apply arguments instead of spreading for performance.

        return resultFunc.apply(null, arguments);
      }].concat(finalMemoizeOptions)); // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.

      var selector = memoize(function dependenciesChecker() {
        var params = [];
        var length = dependencies.length;

        for (var i = 0; i < length; i++) {
          // apply arguments instead of spreading and mutate a local list of params for performance.
          // @ts-ignore
          params.push(dependencies[i].apply(null, arguments));
        } // apply arguments instead of spreading for performance.


        _lastResult = memoizedResultFunc.apply(null, params);
        return _lastResult;
      });
      Object.assign(selector, {
        resultFunc: resultFunc,
        memoizedResultFunc: memoizedResultFunc,
        dependencies: dependencies,
        lastResult: function lastResult() {
          return _lastResult;
        },
        recomputations: function recomputations() {
          return _recomputations;
        },
        resetRecomputations: function resetRecomputations() {
          return _recomputations = 0;
        }
      });
      return selector;
    }; // @ts-ignore


    return createSelector;
  }
  var createSelector = /* #__PURE__ */createSelectorCreator(defaultMemoize);

  const defaultNodeRadius = 50;
  const ringMargin = 10;
  const relationshipHitTolerance = 20;
  const defaultFontSize = 50;

  const black = '#000000';
  const white = '#ffffff';
  const blueGreen = '#58c8e3';
  const purple = '#9bafda';

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

  const imageAttributes = styleAttributeGroups
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

  const average = (points) => {
      const sumX = points.reduce((sum, point) => sum + point.x, 0);
      const sumY = points.reduce((sum, point) => sum + point.y, 0);
      return new Point(sumX / points.length, sumY / points.length)
  };

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

  function drawSolidRectangle(ctx, topLeft, width, height, radius, color) {
      const x = topLeft.x;
      const y = topLeft.y;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.fill();
      ctx.closePath();
  }

  const drawTextLine = (ctx, line, position, alignment) => {
      ctx.textAlign = alignment;
      ctx.fillText(line, position.x, position.y);
  };

  const drawPolygon = (ctx, points, fill, stroke) => {
      if (points.length < 3) {
          return
      }
      ctx.fillStyle = fill || 'none';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(point => {
          ctx.lineTo(point.x, point.y);
          stroke && ctx.stroke();
      });
      ctx.closePath();
      fill && ctx.fill();
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

  const containsCachedImage = (cachedImages, imageUrl) => {
      return cachedImages.hasOwnProperty(imageUrl)
  };

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

  const loadImage = (imageUrl, onLoad, onError) => {
      let dataUrl = undefined;

      const image = document.createElement('img');
      image.setAttribute('crossorigin', 'anonymous');
      image.onload = () => {
          onLoad({
              status: 'LOADED',
              image,
              dataUrl,
              width: image.naturalWidth,
              height: image.naturalHeight
          });
      };
      image.onerror = () => {
          onError({
              status: 'ERROR',
              errorMessage: 'Image failed to load',
              image: document.createElement('img'),
              width: 0,
              height: 0
          });
      };

      fetch(imageUrl)
          .then(response => {
              if (!response.ok) {
                  throw Error(response.statusText);
              }
              return response.blob()
          })
          .then(blob => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function() {
                  dataUrl = reader.result;
                  image.src = dataUrl;
              };
          })
          .catch(reason => {
              onError({
                  status: 'ERROR',
                  errorMessage: reason,
                  image: image,
                  width: 0,
                  height: 0
              });
          });

      return {
          status: 'LOADING',
          image,
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

  function nextId(id) {
      return 'n' + (parseInt(id.substring(1)) + 1)
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
          ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
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

  const selectedNodeIds = (selection) => {
      return selection.entities.filter(entity => entity.entityType === 'node').map(entity => entity.id)
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

  const handleSize = 20;
  const handlePadding = 2;

  const choose = (mode, min, max) => {
      switch (mode) {
          case 'min':
              return min
          case 'max':
              return max
          default:
              return (min + max) / 2
      }
  };

  const inRange = (value, min, max) => {
      return value >= min && value <= max
  };

  class TransformationHandles {
      constructor(visualGraph, selection, mouse, viewTransformation) {
          const nodeIds = selectedNodeIds(selection);
          if (mouse.dragType === 'NONE' && nodeIds.length > 1) {
              const box = combineBoundingBoxes(nodeIds.map(nodeId => visualGraph.nodes[nodeId].boundingBox()));
              const dimensions = ['x', 'y'];
              const modes = {};
              dimensions.forEach(dimension => {
                  const coordinates = nodeIds.map(nodeId => visualGraph.nodes[nodeId].position[dimension]);
                  const min = Math.min(...coordinates);
                  const max = Math.max(...coordinates);
                  const spread = max - min;
                  if (spread > 1) {
                      modes[dimension] = ['min', 'mid', 'max'];
                  } else {
                      modes[dimension] = ['mid'];
                  }
              });

              const transform = (position) => viewTransformation.transform(position);
              const corners = [];
              modes.x.forEach(x => {
                  modes.y.forEach(y => {
                      if (x !== 'mid' || y !== 'mid') {
                          corners.push({
                              x,
                              y
                          });
                      }
                  });
              });
              this.handles = corners.map(corner => {
                  const anchor = transform(new Point(
                      choose(corner.x, box.left, box.right),
                      choose(corner.y, box.top, box.bottom)
                  ));
                  const topLeft = anchor.translate(new Vector(
                      choose(corner.x, -handleSize, 0),
                      choose(corner.y, -handleSize, 0)
                  ));
                  return {
                      corner,
                      anchor,
                      topLeft
                  }
              });
              this.color = adaptForBackground(selectionHandle, key => visualGraph.style[key]);
          } else {
              this.handles = [];
          }
      }

      draw(ctx) {
          this.handles.forEach(handle => {
              drawSolidRectangle(ctx, handle.topLeft, handleSize, handleSize, 3, this.color);
              drawSolidRectangle(
                  ctx, handle.topLeft.translate(new Vector(
                      (handle.corner.x === 'min' ? (handleSize) / 2 : handlePadding),
                      (handle.corner.y === 'min' ? (handleSize) / 2 : handlePadding)
                  )),
                  handle.corner.x === 'mid' ? handleSize - handlePadding * 2 : handleSize / 2 - handlePadding,
                  handle.corner.y === 'mid' ? handleSize - handlePadding * 2 : handleSize / 2 - handlePadding,
                  2,
                  'white'
              );
          });
      }

      handleAtPoint(canvasPosition) {
          return this.handles.find(handle =>
              inRange(canvasPosition.x, handle.topLeft.x, handle.topLeft.x + handleSize) &&
              inRange(canvasPosition.y, handle.topLeft.y, handle.topLeft.y + handleSize)
          )
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

  class BackgroundImage {
      constructor(style, imageCache) {
          const backgroundImageUrl = style['background-image'];
          if (!!backgroundImageUrl) {
              const backgroundSize = parseFloat(style['background-size']) / 100;
              this.imageInfo = getCachedImage(imageCache, backgroundImageUrl);
              this.width = this.imageInfo.width * backgroundSize;
              this.height = this.imageInfo.height * backgroundSize;
          }
      }

      draw(ctx, displayOptions) {
          if (!!this.imageInfo) {
              ctx.save();
              const viewTransformation = displayOptions.viewTransformation;
              ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
              ctx.scale(viewTransformation.scale);
              ctx.image(this.imageInfo, -this.width / 2, -this.height / 2, this.width, this.height);
              ctx.restore();
          }
      }
  }

  const getSelection = (state) => state.selection;
  const getMouse = (state) => state.mouse;
  const getViewTransformation = (state) => state.viewTransformation;
  const getCachedImages = (state) => state.cachedImages;

  const getPresentGraph = state => state.graph.present || state.graph;

  const getGraph = (state) => {
      const {
          layers
      } = state.applicationLayout || {};

      if (layers && layers.length > 0) {
          return layers.reduce((resultState, layer) => {
              if (layer.selector) {
                  return layer.selector({
                      graph: resultState,
                      [layer.name]: state[layer.name]
                  })
              } else {
                  return resultState
              }
          }, getPresentGraph(state))
      } else {
          return getPresentGraph(state)
      }
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

  const getVisualGraph = createSelector(
      [getGraph, getSelection, getCachedImages],
      (graph, selection, cachedImages) => {
          const visualNodes = graph.nodes.reduce((nodeMap, node) => {
              nodeMap[node.id] = getVisualNode(node, graph, selection, cachedImages);
              return nodeMap
          }, {});

          const relationshipAttachments = computeRelationshipAttachments(graph, visualNodes);

          const resolvedRelationships = graph.relationships.map(relationship =>
              new ResolvedRelationship(
                  relationship,
                  visualNodes[relationship.fromId],
                  visualNodes[relationship.toId],
                  relationshipAttachments.start[relationship.id],
                  relationshipAttachments.end[relationship.id],
                  relationshipSelected(selection, relationship.id),
                  graph
              )
          );
          const relationshipBundles = bundle(resolvedRelationships).map(bundle => {
              return new RoutedRelationshipBundle(bundle, graph, selection, measureTextContext, cachedImages);
          });

          return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext)
      }
  );

  const getBackgroundImage = createSelector(
      [getGraph, getCachedImages],
      (graph, cachedImages) => {
          return new BackgroundImage(graph.style, cachedImages)
      }
  );

  const getTransformationHandles = createSelector(
      [getVisualGraph, getSelection, getMouse, getViewTransformation],
      (visualGraph, selection, mouse, viewTransformation) => {
          return new TransformationHandles(visualGraph, selection, mouse, viewTransformation)
      }
  );

  const getPositionsOfSelectedNodes = createSelector(
      [getVisualGraph, getSelection],
      (visualGraph, selection) => {
          const nodePositions = [];
          selectedNodeIds(selection).forEach((nodeId) => {
              const visualNode = visualGraph.nodes[nodeId];
              nodePositions.push({
                  nodeId: visualNode.id,
                  position: visualNode.position,
                  radius: visualNode.radius
              });
          });
          return nodePositions
      }
  );

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var redux = {exports: {}};

  (function (module, exports) {
  	(function (global, factory) {
  	factory(exports) ;
  	}(commonjsGlobal, (function (exports) {
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

  	var ActionTypes = {
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

  	  {
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
  	    throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.');
  	  }

  	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
  	    enhancer = preloadedState;
  	    preloadedState = undefined;
  	  }

  	  if (typeof enhancer !== 'undefined') {
  	    if (typeof enhancer !== 'function') {
  	      throw new Error("Expected the enhancer to be a function. Instead, received: '" + kindOf(enhancer) + "'");
  	    }

  	    return enhancer(createStore)(reducer, preloadedState);
  	  }

  	  if (typeof reducer !== 'function') {
  	    throw new Error("Expected the root reducer to be a function. Instead, received: '" + kindOf(reducer) + "'");
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
  	      throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
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
  	      throw new Error("Expected the listener to be a function. Instead, received: '" + kindOf(listener) + "'");
  	    }

  	    if (isDispatching) {
  	      throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
  	    }

  	    var isSubscribed = true;
  	    ensureCanMutateNextListeners();
  	    nextListeners.push(listener);
  	    return function unsubscribe() {
  	      if (!isSubscribed) {
  	        return;
  	      }

  	      if (isDispatching) {
  	        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
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
  	      throw new Error("Actions must be plain objects. Instead, the actual type was: '" + kindOf(action) + "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.");
  	    }

  	    if (typeof action.type === 'undefined') {
  	      throw new Error('Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
  	    }

  	    if (isDispatching) {
  	      throw new Error('Reducers may not dispatch actions.');
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
  	      throw new Error("Expected the nextReducer to be a function. Instead, received: '" + kindOf(nextReducer));
  	    }

  	    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
  	    // Any reducers that existed in both the new and old rootReducer
  	    // will receive the previous state. This effectively populates
  	    // the new state tree with any relevant data from the old one.

  	    dispatch({
  	      type: ActionTypes.REPLACE
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
  	          throw new Error("Expected the observer to be an object. Instead, received: '" + kindOf(observer) + "'");
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
  	    type: ActionTypes.INIT
  	  });
  	  return _ref2 = {
  	    dispatch: dispatch,
  	    subscribe: subscribe,
  	    getState: getState,
  	    replaceReducer: replaceReducer
  	  }, _ref2[$$observable] = observable, _ref2;
  	}
  	/**
  	 * Creates a Redux store that holds the state tree.
  	 *
  	 * **We recommend using `configureStore` from the
  	 * `@reduxjs/toolkit` package**, which replaces `createStore`:
  	 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
  	 *
  	 * The only way to change the data in the store is to call `dispatch()` on it.
  	 *
  	 * There should only be a single store in your app. To specify how different
  	 * parts of the state tree respond to actions, you may combine several reducers
  	 * into a single reducer function by using `combineReducers`.
  	 *
  	 * @param {Function} reducer A function that returns the next state tree, given
  	 * the current state tree and the action to handle.
  	 *
  	 * @param {any} [preloadedState] The initial state. You may optionally specify it
  	 * to hydrate the state from the server in universal apps, or to restore a
  	 * previously serialized user session.
  	 * If you use `combineReducers` to produce the root reducer function, this must be
  	 * an object with the same shape as `combineReducers` keys.
  	 *
  	 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
  	 * to enhance the store with third-party capabilities such as middleware,
  	 * time travel, persistence, etc. The only store enhancer that ships with Redux
  	 * is `applyMiddleware()`.
  	 *
  	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
  	 * and subscribe to changes.
  	 */

  	var legacy_createStore = createStore;

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
  	  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

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
  	  if (action && action.type === ActionTypes.REPLACE) return;

  	  if (unexpectedKeys.length > 0) {
  	    return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
  	  }
  	}

  	function assertReducerShape(reducers) {
  	  Object.keys(reducers).forEach(function (key) {
  	    var reducer = reducers[key];
  	    var initialState = reducer(undefined, {
  	      type: ActionTypes.INIT
  	    });

  	    if (typeof initialState === 'undefined') {
  	      throw new Error("The slice reducer for key \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
  	    }

  	    if (typeof reducer(undefined, {
  	      type: ActionTypes.PROBE_UNKNOWN_ACTION()
  	    }) === 'undefined') {
  	      throw new Error("The slice reducer for key \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle '" + ActionTypes.INIT + "' or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
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

  	    {
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

  	  {
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

  	    {
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
  	        throw new Error("When called with an action of type " + (actionType ? "\"" + String(actionType) + "\"" : '(unknown type)') + ", the slice reducer for key \"" + _key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.");
  	      }

  	      nextState[_key] = nextStateForKey;
  	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
  	    }

  	    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
  	    return hasChanged ? nextState : state;
  	  };
  	}

  	function bindActionCreator(actionCreator, dispatch) {
  	  return function () {
  	    return dispatch(actionCreator.apply(this, arguments));
  	  };
  	}
  	/**
  	 * Turns an object whose values are action creators, into an object with the
  	 * same keys, but with every function wrapped into a `dispatch` call so they
  	 * may be invoked directly. This is just a convenience method, as you can call
  	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
  	 *
  	 * For convenience, you can also pass an action creator as the first argument,
  	 * and get a dispatch wrapped function in return.
  	 *
  	 * @param {Function|Object} actionCreators An object whose values are action
  	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
  	 * syntax. You may also pass a single function.
  	 *
  	 * @param {Function} dispatch The `dispatch` function available on your Redux
  	 * store.
  	 *
  	 * @returns {Function|Object} The object mimicking the original object, but with
  	 * every action creator wrapped into the `dispatch` call. If you passed a
  	 * function as `actionCreators`, the return value will also be a single
  	 * function.
  	 */


  	function bindActionCreators(actionCreators, dispatch) {
  	  if (typeof actionCreators === 'function') {
  	    return bindActionCreator(actionCreators, dispatch);
  	  }

  	  if (typeof actionCreators !== 'object' || actionCreators === null) {
  	    throw new Error("bindActionCreators expected an object or a function, but instead received: '" + kindOf(actionCreators) + "'. " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
  	  }

  	  var boundActionCreators = {};

  	  for (var key in actionCreators) {
  	    var actionCreator = actionCreators[key];

  	    if (typeof actionCreator === 'function') {
  	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
  	    }
  	  }

  	  return boundActionCreators;
  	}

  	function _defineProperty(obj, key, value) {
  	  if (key in obj) {
  	    Object.defineProperty(obj, key, {
  	      value: value,
  	      enumerable: true,
  	      configurable: true,
  	      writable: true
  	    });
  	  } else {
  	    obj[key] = value;
  	  }

  	  return obj;
  	}

  	function ownKeys(object, enumerableOnly) {
  	  var keys = Object.keys(object);

  	  if (Object.getOwnPropertySymbols) {
  	    var symbols = Object.getOwnPropertySymbols(object);
  	    if (enumerableOnly) symbols = symbols.filter(function (sym) {
  	      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
  	    });
  	    keys.push.apply(keys, symbols);
  	  }

  	  return keys;
  	}

  	function _objectSpread2(target) {
  	  for (var i = 1; i < arguments.length; i++) {
  	    var source = arguments[i] != null ? arguments[i] : {};

  	    if (i % 2) {
  	      ownKeys(Object(source), true).forEach(function (key) {
  	        _defineProperty(target, key, source[key]);
  	      });
  	    } else if (Object.getOwnPropertyDescriptors) {
  	      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
  	    } else {
  	      ownKeys(Object(source)).forEach(function (key) {
  	        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
  	      });
  	    }
  	  }

  	  return target;
  	}

  	/**
  	 * Composes single-argument functions from right to left. The rightmost
  	 * function can take multiple arguments as it provides the signature for
  	 * the resulting composite function.
  	 *
  	 * @param {...Function} funcs The functions to compose.
  	 * @returns {Function} A function obtained by composing the argument functions
  	 * from right to left. For example, compose(f, g, h) is identical to doing
  	 * (...args) => f(g(h(...args))).
  	 */
  	function compose() {
  	  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
  	    funcs[_key] = arguments[_key];
  	  }

  	  if (funcs.length === 0) {
  	    return function (arg) {
  	      return arg;
  	    };
  	  }

  	  if (funcs.length === 1) {
  	    return funcs[0];
  	  }

  	  return funcs.reduce(function (a, b) {
  	    return function () {
  	      return a(b.apply(void 0, arguments));
  	    };
  	  });
  	}

  	/**
  	 * Creates a store enhancer that applies middleware to the dispatch method
  	 * of the Redux store. This is handy for a variety of tasks, such as expressing
  	 * asynchronous actions in a concise manner, or logging every action payload.
  	 *
  	 * See `redux-thunk` package as an example of the Redux middleware.
  	 *
  	 * Because middleware is potentially asynchronous, this should be the first
  	 * store enhancer in the composition chain.
  	 *
  	 * Note that each middleware will be given the `dispatch` and `getState` functions
  	 * as named arguments.
  	 *
  	 * @param {...Function} middlewares The middleware chain to be applied.
  	 * @returns {Function} A store enhancer applying the middleware.
  	 */

  	function applyMiddleware() {
  	  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
  	    middlewares[_key] = arguments[_key];
  	  }

  	  return function (createStore) {
  	    return function () {
  	      var store = createStore.apply(void 0, arguments);

  	      var _dispatch = function dispatch() {
  	        throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
  	      };

  	      var middlewareAPI = {
  	        getState: store.getState,
  	        dispatch: function dispatch() {
  	          return _dispatch.apply(void 0, arguments);
  	        }
  	      };
  	      var chain = middlewares.map(function (middleware) {
  	        return middleware(middlewareAPI);
  	      });
  	      _dispatch = compose.apply(void 0, chain)(store.dispatch);
  	      return _objectSpread2(_objectSpread2({}, store), {}, {
  	        dispatch: _dispatch
  	      });
  	    };
  	  };
  	}

  	/*
  	 * This is a dummy function to check if the function name has been altered by minification.
  	 * If the function has been minified and NODE_ENV !== 'production', warn the user.
  	 */

  	function isCrushed() {}

  	if (typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  	  warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  	}

  	exports.__DO_NOT_USE__ActionTypes = ActionTypes;
  	exports.applyMiddleware = applyMiddleware;
  	exports.bindActionCreators = bindActionCreators;
  	exports.combineReducers = combineReducers;
  	exports.compose = compose;
  	exports.createStore = createStore;
  	exports.legacy_createStore = legacy_createStore;

  	Object.defineProperty(exports, '__esModule', { value: true });

  	})));
  } (redux, redux.exports));

  /** A function that accepts a potential "extra argument" value to be injected later,
   * and returns an instance of the thunk middleware that uses that value
   */
   function createThunkMiddleware(extraArgument) {
      // Standard Redux middleware definition pattern:
      // See: https://redux.js.org/tutorials/fundamentals/part-4-store#writing-custom-middleware
      var middleware = function middleware(_ref) {
        var dispatch = _ref.dispatch,
            getState = _ref.getState;
        return function (next) {
          return function (action) {
            // The thunk middleware looks for any functions that were passed to `store.dispatch`.
            // If this "action" is really a function, call it and return the result.
            if (typeof action === 'function') {
              // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
              return action(dispatch, getState, extraArgument);
            } // Otherwise, pass the action down the middleware chain as usual
    
    
            return next(action);
          };
        };
      };
    
      return middleware;
    }
    
    var thunk = createThunkMiddleware(); // Attach the factory function so users can create a customized version
    // with whatever "extra arg" they want to inject into their thunks
    
    thunk.withExtraArgument = createThunkMiddleware;

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

  var reduxUndo = {exports: {}};

  (function (module, exports) {
  	!function(t,e){module.exports=e();}(window,(function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r});},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){t.exports=n(1);},function(t,e,n){n.r(e);var r,o,i={UNDO:"@@redux-undo/UNDO",REDO:"@@redux-undo/REDO",JUMP_TO_FUTURE:"@@redux-undo/JUMP_TO_FUTURE",JUMP_TO_PAST:"@@redux-undo/JUMP_TO_PAST",JUMP:"@@redux-undo/JUMP",CLEAR_HISTORY:"@@redux-undo/CLEAR_HISTORY"},u={undo:function(){return {type:i.UNDO}},redo:function(){return {type:i.REDO}},jumpToFuture:function(t){return {type:i.JUMP_TO_FUTURE,index:t}},jumpToPast:function(t){return {type:i.JUMP_TO_PAST,index:t}},jump:function(t){return {type:i.JUMP,index:t}},clearHistory:function(){return {type:i.CLEAR_HISTORY}}};function c(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];return Array.isArray(t)?t:"string"==typeof t?[t]:e}function a(t){return void 0!==t.present&&void 0!==t.future&&void 0!==t.past&&Array.isArray(t.future)&&Array.isArray(t.past)}function p(t){var e=c(t);return function(t){return e.indexOf(t.type)>=0}}function l(t){var e=c(t);return function(t){return e.indexOf(t.type)<0}}function f(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return e.reduce((function(t,e){return function(n,r,o){return t(n,r,o)&&e(n,r,o)}}),(function(){return !0}))}function s(t){var e=c(t);return function(t){return e.indexOf(t.type)>=0?t.type:null}}function d(t,e,n){return {past:t,present:e,future:n,group:arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,_latestUnfiltered:e,index:t.length,limit:t.length+n.length+1}}function y(t){return function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}var g={prevState:"#9E9E9E",action:"#03A9F4",nextState:"#4CAF50"};function v(t,e,n){return ["%c".concat(t),"color: ".concat(e,"; font-weight: bold"),n]}function O(t,e){o={header:[],prev:[],action:[],next:[],msgs:[]},r&&(console.group?(o.header=["%credux-undo","font-style: italic","action",t.type],o.action=v("action",g.action,t),o.prev=v("prev history",g.prevState,e)):(o.header=["redux-undo action",t.type],o.action=["action",t],o.prev=["prev history",e]));}function T(t){var e,n,i,u,c,a,p,l,f,s,d,O,T,b,m,h;r&&(console.group?o.next=v("next history",g.nextState,t):o.next=["next history",t],O=(d=o).header,T=d.prev,b=d.next,m=d.action,h=d.msgs,console.group?((e=console).groupCollapsed.apply(e,y(O)),(n=console).log.apply(n,y(T)),(i=console).log.apply(i,y(m)),(u=console).log.apply(u,y(b)),(c=console).log.apply(c,y(h)),console.groupEnd()):((a=console).log.apply(a,y(O)),(p=console).log.apply(p,y(T)),(l=console).log.apply(l,y(m)),(f=console).log.apply(f,y(b)),(s=console).log.apply(s,y(h))));}function b(){if(r){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];o.msgs=o.msgs.concat([].concat(e,["\n"]));}}function m(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r);}return n}function h(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?m(Object(n),!0).forEach((function(e){x(t,e,n[e]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e));}));}return t}function x(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function j(t){return function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function A(t,e){var n=d([],t,[]);return e&&(n._latestUnfiltered=null),n}function _(t,e,n,r){var o=t.past.length+1;b("inserting",e),b("new free: ",n-o);var i=t.past,u=t._latestUnfiltered,c=n&&n<=o,a=i.slice(c?1:0);return d(null!=u?[].concat(j(a),[u]):a,e,[],r)}function P(t,e){if(e<0||e>=t.future.length)return t;var n=t.past,r=t.future,o=t._latestUnfiltered;return d([].concat(j(n),[o],j(r.slice(0,e))),r[e],r.slice(e+1))}function S(t,e){if(e<0||e>=t.past.length)return t;var n=t.past,r=t.future,o=t._latestUnfiltered,i=n.slice(0,e),u=[].concat(j(n.slice(e+1)),[o],j(r));return d(i,n[e],u)}function U(t,e){return e>0?P(t,e-1):e<0?S(t,t.past.length+e):t}function w(t,e){return e.indexOf(t)>-1?t:!t}function E(t){var e,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e=n.debug,r=e;var o,u=h({limit:void 0,filter:function(){return !0},groupBy:function(){return null},undoType:i.UNDO,redoType:i.REDO,jumpToPastType:i.JUMP_TO_PAST,jumpToFutureType:i.JUMP_TO_FUTURE,jumpType:i.JUMP,neverSkipReducer:!1,ignoreInitialState:!1,syncFilter:!1},n,{initTypes:c(n.initTypes,["@@redux-undo/INIT"]),clearHistoryType:c(n.clearHistoryType,[i.CLEAR_HISTORY])}),p=u.neverSkipReducer?function(e,n){for(var r=arguments.length,o=new Array(r>2?r-2:0),i=2;i<r;i++)o[i-2]=arguments[i];return h({},e,{present:t.apply(void 0,[e.present,n].concat(o))})}:function(t){return t};return function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:o,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};O(n,e);for(var r,i=e,c=arguments.length,l=new Array(c>2?c-2:0),f=2;f<c;f++)l[f-2]=arguments[f];if(!o){if(b("history is uninitialized"),void 0===e){var s={type:"@@redux-undo/CREATE_HISTORY"},y=t.apply(void 0,[e,s].concat(l));return i=A(y,u.ignoreInitialState),b("do not set initialState on probe actions"),T(i),i}a(e)?(i=o=u.ignoreInitialState?e:d(e.past,e.present,e.future),b("initialHistory initialized: initialState is a history",o)):(i=o=A(e,u.ignoreInitialState),b("initialHistory initialized: initialState is not a history",o));}switch(n.type){case void 0:return i;case u.undoType:return r=U(i,-1),b("perform undo"),T(r),p.apply(void 0,[r,n].concat(l));case u.redoType:return r=U(i,1),b("perform redo"),T(r),p.apply(void 0,[r,n].concat(l));case u.jumpToPastType:return r=S(i,n.index),b("perform jumpToPast to ".concat(n.index)),T(r),p.apply(void 0,[r,n].concat(l));case u.jumpToFutureType:return r=P(i,n.index),b("perform jumpToFuture to ".concat(n.index)),T(r),p.apply(void 0,[r,n].concat(l));case u.jumpType:return r=U(i,n.index),b("perform jump to ".concat(n.index)),T(r),p.apply(void 0,[r,n].concat(l));case w(n.type,u.clearHistoryType):return r=A(i.present,u.ignoreInitialState),b("perform clearHistory"),T(r),p.apply(void 0,[r,n].concat(l));default:if(r=t.apply(void 0,[i.present,n].concat(l)),u.initTypes.some((function(t){return t===n.type})))return b("reset history due to init action"),T(o),o;if(i._latestUnfiltered===r)return i;var g="function"==typeof u.filter&&!u.filter(n,r,i);if(g){var v=d(i.past,r,i.future,i.group);return u.syncFilter||(v._latestUnfiltered=i._latestUnfiltered),b("filter ignored action, not storing it in past"),T(v),v}var m=u.groupBy(n,r,i);if(null!=m&&m===i.group){var h=d(i.past,r,i.future,i.group);return b("groupBy grouped the action with the previous action"),T(h),h}return i=_(i,r,u.limit,m),b("inserted new state into history"),T(i),i}}}n.d(e,"ActionTypes",(function(){return i})),n.d(e,"ActionCreators",(function(){return u})),n.d(e,"parseActions",(function(){return c})),n.d(e,"isHistory",(function(){return a})),n.d(e,"includeAction",(function(){return p})),n.d(e,"excludeAction",(function(){return l})),n.d(e,"combineFilters",(function(){return f})),n.d(e,"groupByActionTypes",(function(){return s})),n.d(e,"newHistory",(function(){return d})),n.d(e,"default",(function(){return E}));}])}));
  } (reduxUndo));

  var undoable = /*@__PURE__*/getDefaultExportFromCjs(reduxUndo.exports);

  const graph = (state = emptyGraph(), action) => {
      switch (action.type) {
          case 'INIT_GRAPH':
              {
                  const newNodes = action.graph.nodes.map(item => ({
                      ...item,
                      position: new Point(item.position.x, item.position.y)
                  }));

                  const newRelationships = action.graph.relationships.slice();

                  return {
                      style: state.style,
                      nodes: newNodes,
                      relationships: newRelationships
                  }
              } 

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
      groupBy: reduxUndo.exports.groupByActionTypes('MOVE_NODES')
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
          case reduxUndo.exports.ActionTypes.UNDO:
          case reduxUndo.exports.ActionTypes.REDO:
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

  const byAscendingError = (a, b) => a.error - b.error;

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

  // canvas view transformation
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

  // 手势
  const gestures = redux.exports.combineReducers({
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

  function cachedImages(state = {}, action) {
      if (action.type === 'IMAGE_EVENT') {
          return {
              ...state,
              [action.imageUrl]: action.cachedImage
          }
      }

      return state
  }

  const arrowsAppReducers = redux.exports.combineReducers({
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
      cachedImages
  });

  const adjustViewport = (scale, panX, panY) => {
      return {
          type: 'ADJUST_VIEWPORT',
          scale,
          panX,
          panY
      }
  };

  const isVertical = (line) => {
      return Math.abs(Math.PI / 2 - Math.abs(line.angle)) < 0.01
  };

  const intersectVertical = (vertical, other) => {
      return {
          possible: true,
          intersection: new Point(
              vertical.center.x,
              Math.tan(other.angle) * (vertical.center.x - other.center.x) + other.center.y
          )
      }
  };

  const areParallel = (lineA, lineB) => {
      return Math.abs((lineA.angle - lineB.angle) % Math.PI) < 0.01
  };

  const intersectLineAndLine = (lineA, lineB) => {
      if (areParallel(lineA, lineB)) {
          return {
              possible: false
          }
      }
      if (isVertical(lineA)) {
          return intersectVertical(lineA, lineB)
      }
      if (isVertical(lineB)) {
          return intersectVertical(lineB, lineA)
      }
      const mA = Math.tan(lineA.angle);
      const mB = Math.tan(lineB.angle);
      const x = ((mA * lineA.center.x - mB * lineB.center.x) - (lineA.center.y - lineB.center.y)) / (mA - mB);
      return {
          possible: true,
          intersection: new Point(x, mA * (x - lineA.center.x) + lineA.center.y)
      }
  };

  const sq = (d) => d * d;

  const intersectVerticalLineAndCircle = (line, circle, naturalPosition) => {
      const dx = Math.abs(circle.center.x - line.center.x);
      if (dx > circle.radius) {
          return {
              possible: false
          }
      } else {
          const dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
          const y = circle.center.y < naturalPosition.y ? circle.center.y + dy : circle.center.y - dy;
          const intersection = new Point(line.center.x, y);
          return {
              possible: true,
              intersection
          }
      }
  };

  const intersectLineAndCircle = (line, circle, naturalPosition) => {
      if (isVertical(line)) {
          return intersectVerticalLineAndCircle(line, circle, naturalPosition)
      }

      const m = Math.tan(line.angle);
      const n = line.center.y - m * line.center.x;

      const a = 1 + sq(m);
      const b = -circle.center.x * 2 + (m * (n - circle.center.y)) * 2;
      const c = sq(circle.center.x) + sq(n - circle.center.y) - sq(circle.radius);

      const d = sq(b) - 4 * a * c;
      if (d >= 0) {
          const intersections = [
              (-b + Math.sqrt(d)) / (2 * a),
              (-b - Math.sqrt(d)) / (2 * a)
          ].map(x => new Point(x, m * x + n));
          const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance());
          const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1];
          return {
              possible: true,
              intersection
          }
      } else {
          return {
              possible: false
          }
      }
  };

  const intersectCircleAndCircle = (circleA, circleB, naturalPosition) => {
      const betweenCenters = circleA.center.vectorFrom(circleB.center);
      const d = betweenCenters.distance();
      if (d > Math.abs(circleA.radius - circleB.radius) && d < circleA.radius + circleB.radius) {
          const a = (circleB.radius * circleB.radius - circleA.radius * circleA.radius + d * d) / (2 * d);
          const midPoint = circleB.center.translate(betweenCenters.scale(a / d));
          const h = Math.sqrt(circleB.radius * circleB.radius - a * a);
          const bisector = betweenCenters.perpendicular().scale(h / d);
          const intersections = [midPoint.translate(bisector), midPoint.translate(bisector.invert())];
          const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance());
          const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1];
          return {
              possible: true,
              intersection
          }
      } else {
          return {
              possible: false
          }
      }
  };

  const coLinearIntervals = (natural, coLinear) => {
      if (coLinear.length < 2) return []

      const intervals = [];
      const nearest = coLinear.sort((a, b) => Math.abs(natural - a) - Math.abs(natural - b))[0];
      const sorted = coLinear.sort((a, b) => a - b);
      const nearestIndex = sorted.indexOf(nearest);
      const polarity = Math.sign(nearest - natural);
      if ((nearestIndex > 0 && polarity < 0) || (nearestIndex < sorted.length - 1 && polarity > 0)) {
          const secondNearest = sorted[nearestIndex + polarity];
          const interval = nearest - secondNearest;
          const candidate = nearest + interval;
          intervals.push({
              candidate,
              error: Math.abs(candidate - natural)
          });
      }
      if ((nearestIndex > 0 && polarity > 0) || (nearestIndex < sorted.length - 1 && polarity < 0)) {
          const opposite = sorted[nearestIndex - polarity];
          const interval = nearest - opposite;
          const candidate = nearest - (interval / 2);
          intervals.push({
              candidate,
              error: Math.abs(candidate - natural)
          });
      }
      return intervals
  };

  const angularDifference = (a, b) => {
      const rawDifference = Math.abs(a - b);
      return Math.min(rawDifference, Math.PI * 2 - rawDifference)
  };

  const angularIntervals = (natural, equidistant) => {
      if (equidistant.length < 2) return []

      const intervals = [];
      const nearest = equidistant.sort((a, b) => angularDifference(natural, a) - angularDifference(natural, b))[0];
      const sorted = equidistant.sort((a, b) => a - b);
      const nearestIndex = sorted.indexOf(nearest);
      const polarity = Math.sign(nearest - natural);
      const wrapIndex = (index) => {
          if (index < 0) return index + sorted.length
          if (index > sorted.length - 1) return index - sorted.length
          return index
      };
      const secondNearest = sorted[wrapIndex(nearestIndex + polarity)];
      const extensionInterval = nearest - secondNearest;
      const extensionCandidate = nearest + extensionInterval;
      intervals.push({
          candidate: extensionCandidate,
          error: Math.abs(extensionCandidate - natural)
      });
      const opposite = sorted[wrapIndex(nearestIndex - polarity)];
      const bisectionInterval = nearest - opposite;
      const bisectionCandidate = nearest - (bisectionInterval / 2);
      intervals.push({
          candidate: bisectionCandidate,
          error: Math.abs(bisectionCandidate - natural)
      });
      return intervals
  };

  class LineGuide {
      constructor(center, angle, naturalPosition) {
          this.center = center;
          this.angle = angle;
          this.error = this.calculateError(naturalPosition);
      }

      get type() {
          return 'LINE'
      }

      calculateError(naturalPosition) {
          let yAxisPoint = naturalPosition.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle);
          return Math.abs(yAxisPoint.y)
      }

      snap(naturalPosition) {
          return this.point(this.scalar(naturalPosition))
      }

      scalar(position) {
          let xAxisPoint = position.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle);
          return xAxisPoint.x
      }

      point(scalar) {
          return new Point(scalar, 0).rotate(this.angle).translate(this.center.vectorFromOrigin())
      }

      combine(otherGuide, naturalPosition) {
          switch (otherGuide.type) {
              case 'LINE':
                  return intersectLineAndLine(this, otherGuide)

              case 'CIRCLE':
                  return intersectLineAndCircle(this, otherGuide, naturalPosition)

              default:
                  throw Error('unknown Guide type: ' + otherGuide.type)
          }
      }

      intervalGuide(nodes, naturalPosition) {
          const otherNodesOnGuide = nodes
              .filter((node) => this.calculateError(node.position) < 0.01)
              .map(node => this.scalar(node.position));
          const intervals = coLinearIntervals(this.scalar(naturalPosition), otherNodesOnGuide);
          intervals.sort(byAscendingError);
          if (intervals.length > 0) {
              const interval = intervals[0];
              return new LineGuide(this.point(interval.candidate), this.angle + Math.PI / 2, naturalPosition)
          }
          return null
      }
  }

  class CircleGuide {
      constructor(center, radius, naturalPosition) {
          this.center = center;
          this.radius = radius;
          this.error = this.calculateError(naturalPosition);
      }

      get type() {
          return 'CIRCLE'
      }

      calculateError(naturalPosition) {
          const offset = naturalPosition.vectorFrom(this.center);
          return Math.abs(offset.distance() - this.radius)
      }

      snap(naturalPosition) {
          let offset = naturalPosition.vectorFrom(this.center);
          return this.center.translate(offset.scale(this.radius / offset.distance()))
      }

      scalar(position) {
          let offset = position.vectorFrom(this.center);
          return offset.angle()
      }

      combine(otherGuide, naturalPosition) {
          switch (otherGuide.type) {
              case 'LINE':
                  return intersectLineAndCircle(otherGuide, this, naturalPosition)

              case 'CIRCLE':
                  return intersectCircleAndCircle(this, otherGuide, naturalPosition)

              default:
                  throw Error('unknown Guide type: ' + otherGuide.type)
          }
      }

      intervalGuide(nodes, naturalPosition) {
          const otherNodesOnGuide = nodes
              .filter((node) => this.calculateError(node.position) < 0.01)
              .map(node => this.scalar(node.position));
          const intervals = angularIntervals(this.scalar(naturalPosition), otherNodesOnGuide);
          intervals.sort(byAscendingError);
          if (intervals.length > 0) {
              const interval = intervals[0];
              return new LineGuide(this.center, interval.candidate, naturalPosition)
          }
          return null
      }
  }

  const snapTolerance = 20;
  const grossTolerance = snapTolerance * 2;
  const angleTolerance = Math.PI / 4;

  const snapToNeighbourDistancesAndAngles = (graph, snappingNodeId, naturalPosition, otherSelectedNodes) => {

      const neighbours = [];
      graph.relationships.forEach((relationship) => {
          if (idsMatch(relationship.fromId, snappingNodeId) && !otherSelectedNodes.includes(relationship.toId)) {
              neighbours.push(graph.nodes.find((node) => idsMatch(node.id, relationship.toId)));
          } else if (idsMatch(relationship.toId, snappingNodeId) && !otherSelectedNodes.includes(relationship.fromId)) {
              neighbours.push(graph.nodes.find((node) => idsMatch(node.id, relationship.fromId)));
          }
      });

      const includeNode = (nodeId) => !idsMatch(nodeId, snappingNodeId) && !otherSelectedNodes.includes(nodeId);

      return snapToDistancesAndAngles(graph, neighbours, includeNode, naturalPosition)
  };

  const snapToDistancesAndAngles = (graph, neighbours, includeNode, naturalPosition) => {

      const isNeighbour = (nodeId) => !!neighbours.find(neighbour => neighbour.id === nodeId);
      let snappedPosition = naturalPosition;

      let possibleGuides = [];

      const neighbourRelationships = {};
      const collectRelationship = (neighbourNodeId, nonNeighbourNodeId) => {
          const pair = {
              neighbour: graph.nodes.find((node) => idsMatch(node.id, neighbourNodeId)),
              nonNeighbour: graph.nodes.find((node) => idsMatch(node.id, nonNeighbourNodeId))
          };
          const pairs = neighbourRelationships[pair.neighbour.id] || [];
          pairs.push(pair);
          neighbourRelationships[pair.neighbour.id] = pairs;
      };

      graph.relationships.forEach((relationship) => {
          if (isNeighbour(relationship.fromId) && includeNode(relationship.toId)) {
              collectRelationship(relationship.fromId, relationship.toId);
          }
          if (includeNode(relationship.fromId) && isNeighbour(relationship.toId)) {
              collectRelationship(relationship.toId, relationship.fromId);
          }
      });

      const snappingAngles = [6, 4, 3]
          .map(denominator => Math.PI / denominator)
          .flatMap(angle => [-1, -0.5, 0, 0.5].map(offset => offset * Math.PI + angle));

      for (const neighbourA of neighbours) {
          const relationshipDistances = [];

          for (const relationship of neighbourRelationships[neighbourA.id] || []) {
              const relationshipVector = relationship.nonNeighbour.position.vectorFrom(relationship.neighbour.position);
              const distance = relationshipVector.distance();
              const similarDistance = relationshipDistances.includes((entry) => Math.abs(entry - distance) < 0.01);
              if (!similarDistance) {
                  relationshipDistances.push(distance);
              }

              const guide = new LineGuide(neighbourA.position, relationshipVector.angle(), naturalPosition);
              if (guide.error < grossTolerance) {
                  possibleGuides.push(guide);
              }
          }

          for (const distance of relationshipDistances) {
              const distanceGuide = new CircleGuide(neighbourA.position, distance, naturalPosition);
              if (distanceGuide.error < grossTolerance) {
                  possibleGuides.push(distanceGuide);
              }
          }

          snappingAngles.forEach(snappingAngle => {
              const diagonalGuide = new LineGuide(neighbourA.position, snappingAngle, naturalPosition);
              const offset = naturalPosition.vectorFrom(neighbourA.position);
              if (diagonalGuide.error < grossTolerance && Math.abs(offset.angle() - snappingAngle) < angleTolerance) {
                  possibleGuides.push(diagonalGuide);
              }
          });

          for (const neighbourB of neighbours) {
              if (neighbourA.id < neighbourB.id) {
                  const interNeighbourVector = neighbourB.position.vectorFrom(neighbourA.position);
                  const segment1 = naturalPosition.vectorFrom(neighbourA.position);
                  const segment2 = neighbourB.position.vectorFrom(naturalPosition);
                  const parallelGuide = new LineGuide(neighbourA.position, interNeighbourVector.angle(), naturalPosition);
                  if (parallelGuide.error < grossTolerance && segment1.dot(segment2) > 0) {
                      possibleGuides.push(parallelGuide);
                  }

                  const midPoint = neighbourA.position.translate(interNeighbourVector.scale(0.5));
                  const perpendicularGuide = new LineGuide(
                      midPoint,
                      interNeighbourVector.rotate(Math.PI / 2).angle(),
                      naturalPosition
                  );

                  if (perpendicularGuide.error < grossTolerance) {
                      possibleGuides.push(perpendicularGuide);
                  }
              }
          }
      }

      const columns = new Set();
      const rows = new Set();
      graph.nodes.forEach((node) => {
          if (includeNode(node.id)) {
              if (Math.abs(naturalPosition.x - node.position.x) < grossTolerance) {
                  columns.add(node.position.x);
              }
              if (Math.abs(naturalPosition.y - node.position.y) < grossTolerance) {
                  rows.add(node.position.y);
              }
          }
      });
      for (const column of columns) {
          possibleGuides.push(new LineGuide(
              new Point(column, naturalPosition.y),
              Math.PI / 2,
              naturalPosition
          ));
      }
      for (const row of rows) {
          possibleGuides.push(new LineGuide(
              new Point(naturalPosition.x, row),
              0,
              naturalPosition
          ));
      }

      const includedNodes = graph.nodes.filter(node => includeNode(node.id));
      const intervalGuides = [];
      for (const guide of possibleGuides) {
          const intervalGuide = guide.intervalGuide(includedNodes, naturalPosition);
          if (intervalGuide && intervalGuide.error < grossTolerance) {
              intervalGuides.push(intervalGuide);
          }
      }
      possibleGuides.push(...intervalGuides);

      const candidateGuides = [...possibleGuides];
      candidateGuides.sort(byAscendingError);

      const guidelines = [];

      while (guidelines.length === 0 && candidateGuides.length > 0) {
          const candidateGuide = candidateGuides.shift();
          if (candidateGuide.error < snapTolerance) {
              guidelines.push(candidateGuide);
              snappedPosition = candidateGuide.snap(naturalPosition);
          }
      }

      while (guidelines.length === 1 && candidateGuides.length > 0) {
          const candidateGuide = candidateGuides.shift();
          const combination = guidelines[0].combine(candidateGuide, naturalPosition);
          if (combination.possible) {
              const error = combination.intersection.vectorFrom(naturalPosition).distance();
              if (error < snapTolerance) {
                  guidelines.push(candidateGuide);
                  snappedPosition = combination.intersection;
              }
          }
      }

      const lineGuides = guidelines.filter(guide => guide.type === 'LINE');
      for (const candidateGuide of possibleGuides) {
          if (!guidelines.includes(candidateGuide) &&
              candidateGuide.calculateError(snappedPosition) < 0.01) {
              if (candidateGuide.type === 'LINE') {
                  if (lineGuides.every(guide => !areParallel(guide, candidateGuide))) {
                      lineGuides.push(candidateGuide);
                      guidelines.push(candidateGuide);
                  }
              } else {
                  guidelines.push(candidateGuide);
              }
          }
      }

      return {
          snapped: guidelines.length > 0,
          guidelines,
          snappedPosition
      }
  };

  const activateEditing = (entity) => ({
      type: 'ACTIVATE_EDITING',
      editing: entity
  });

  const toggleSelection = (entities, mode) => ({
      type: 'TOGGLE_SELECTION',
      entities: entities.map(entity => ({
          entityType: entity.entityType,
          id: entity.id
      })),
      mode
  });

  const clearSelection = () => ({
      type: 'CLEAR_SELECTION',
  });

  const snapToTargetNode = (visualGraph, excludedNodeId, naturalPosition) => {
      const targetNode = visualGraph.closestNode(naturalPosition, (visualNode, distance) => {
          return !idsMatch(visualNode.id, excludedNodeId) && distance < visualNode.radius
      });

      return {
          snapped: targetNode !== null,
          snappedNodeId: targetNode ? targetNode.id : null,
          snappedPosition: targetNode ? targetNode.position : null
      }
  };

  const activateRing = (sourceNodeId, nodeType) => {
      return {
          type: 'ACTIVATE_RING',
          sourceNodeId,
          nodeType
      }
  };

  const deactivateRing = () => {
      return {
          type: 'DEACTIVATE_RING'
      }
  };

  const tryDragRing = (sourceNodeId, mousePosition) => {
      return function(dispatch, getState) {
          const state = getState();
          const selection = state.selection;
          const selected = selectedNodeIds(selection);
          const secondarySourceNodeIds = selected.includes(sourceNodeId) ? selected.filter(nodeId => nodeId !== sourceNodeId) : [];

          const visualGraph = getVisualGraph(state);
          let newNodeRadius = visualGraph.graph.style.radius;
          const graph = visualGraph.graph;
          const sourceNode = graph.nodes.find((node) => idsMatch(node.id, sourceNodeId));
          const primarySnap = snapToTargetNode(visualGraph, null, mousePosition);
          if (primarySnap.snapped) {
              const secondarySnaps = secondarySourceNodeIds.map(secondarySourceNodeId => {
                  const secondarySourceNode = graph.nodes.find((node) => idsMatch(node.id, secondarySourceNodeId));
                  const displacement = secondarySourceNode.position.vectorFrom(sourceNode.position);
                  return snapToTargetNode(visualGraph, null, mousePosition.translate(displacement))
              });
              const targetNodeIds = [
                  primarySnap.snappedNodeId,
                  ...(secondarySnaps.every(snap => snap.snapped) ?
                      secondarySnaps.map(snap => snap.snappedNodeId) :
                      secondarySnaps.map(() => primarySnap.snappedNodeId))
              ];
              dispatch(ringDraggedConnected(
                  sourceNodeId,
                  secondarySourceNodeIds,
                  targetNodeIds,
                  primarySnap.snappedPosition,
                  mousePosition
              ));
          } else {
              const snap = snapToDistancesAndAngles(
                  graph, [sourceNode],
                  () => true,
                  mousePosition
              );
              if (snap.snapped) {
                  dispatch(ringDraggedDisconnected(
                      sourceNodeId,
                      secondarySourceNodeIds,
                      snap.snappedPosition,
                      new Guides(snap.guidelines, mousePosition, newNodeRadius),
                      mousePosition
                  ));
              } else {
                  dispatch(ringDraggedDisconnected(
                      sourceNodeId,
                      secondarySourceNodeIds,
                      mousePosition,
                      new Guides(),
                      mousePosition
                  ));
              }
          }
      }
  };

  const ringDraggedDisconnected = (sourceNodeId, secondarySourceNodeIds, position, guides, newMousePosition) => {
      return {
          type: 'RING_DRAGGED',
          sourceNodeId,
          secondarySourceNodeIds,
          targetNodeIds: [],
          position,
          guides,
          newMousePosition
      }
  };

  const ringDraggedConnected = (sourceNodeId, secondarySourceNodeIds, targetNodeIds, position, newMousePosition) => {
      return {
          type: 'RING_DRAGGED',
          sourceNodeId,
          secondarySourceNodeIds,
          targetNodeIds,
          position,
          guides: new Guides(),
          newMousePosition
      }
  };

  const setMarquee = (from, to) => ({
      type: 'SET_MARQUEE',
      marquee: {
          from,
          to
      },
      newMousePosition: to
  });

  const selectItemsInMarquee = () => {
      return function(dispatch, getState) {
          const state = getState();
          const marquee = state.gestures.selectionMarquee;
          if (marquee) {
              const visualGraph = getVisualGraph(state);
              const boundingBox = getBBoxFromCorners(marquee);
              const entities = visualGraph.entitiesInBoundingBox(boundingBox);
              if (entities.length > 0) {
                  dispatch(toggleSelection(entities, 'or'));
              }
          }
      }
  };

  const getBBoxFromCorners = ({
      from,
      to
  }) => new BoundingBox(
      Math.min(from.x, to.x),
      Math.max(from.x, to.x),
      Math.min(from.y, to.y),
      Math.max(from.y, to.y)
  );

  const getEventHandlers = (state, eventName) => {
      return state.applicationLayout.layers.reduce((handlers, layer) => {
          const layerEvent = layer.eventHandlers[eventName];
          if (layerEvent) {
              return handlers.concat([layerEvent])
          } else {
              return handlers
          }
      }, [])
  };

  const canvasPadding = 50;

  const computeCanvasSize = (applicationLayout) => {
      const {
          windowSize,
      } = applicationLayout;
      return {
          width: windowSize.width,
          height: windowSize.height
      }
  };

  const subtractPadding = (canvasSize) => {
      return {
          width: canvasSize.width - canvasPadding * 2,
          height: canvasSize.height - canvasPadding * 2
      }
  };

  const toGraphPosition = (state, canvasPosition) => state.viewTransformation.inverse(canvasPosition);

  const wheel = (canvasPosition, vector, ctrlKey) => {
      return function(dispatch, getState) {
          const state = getState();
          const boundingBox = getVisualGraph(state).boundingBox();
          const currentScale = state.viewTransformation.scale;
          const canvasSize = subtractPadding(computeCanvasSize(state.applicationLayout));

          if (ctrlKey) {
              const graphPosition = toGraphPosition(state, canvasPosition);
              const fitWidth = canvasSize.width / boundingBox.width;
              const fitHeight = canvasSize.height / boundingBox.height;
              const minScale = Math.min(1, fitWidth, fitHeight);
              const scale = Math.max(currentScale * (100 - vector.dy) / 100, minScale);
              const rawOffset = canvasPosition.vectorFrom(graphPosition.scale(scale));
              const constrainedOffset = constrainScroll(boundingBox, scale, rawOffset, canvasSize);
              const shouldCenter = scale <= fitHeight && scale <= fitWidth && vector.dy > 0;
              const offset = shouldCenter ? moveTowardCenter(minScale, constrainedOffset, boundingBox, canvasSize) : constrainedOffset;
              dispatch(adjustViewport(scale, offset.dx, offset.dy));
          } else {
              const rawOffset = state.viewTransformation.offset.plus(vector.scale(currentScale).invert());
              const offset = constrainScroll(boundingBox, currentScale, rawOffset, canvasSize);
              dispatch(adjustViewport(currentScale, offset.dx, offset.dy));
          }
      }
  };

  const moveTowardCenter = (minScale, offset, boundingBox, canvasSize) => {
      const dimensions = [{
              component: 'dx',
              min: 'left',
              max: 'right',
              extent: 'width'
          },
          {
              component: 'dy',
              min: 'top',
              max: 'bottom',
              extent: 'height'
          }
      ];

      const [dx, dy] = dimensions.map(d => {
          const currentDisplacement = offset[d.component];
          const centreDisplacement = canvasPadding + canvasSize[d.extent] / 2 - (boundingBox[d.max] + boundingBox[d.min]) * minScale / 2;
          const difference = centreDisplacement - currentDisplacement;
          if (Math.abs(difference) > 1) {
              return currentDisplacement + difference * 0.1
          }
          return currentDisplacement
      });
      return new Vector(dx, dy)
  };

  const constrainScroll = (boundingBox, scale, effectiveOffset, canvasSize) => {
      const constrainedOffset = new Vector(effectiveOffset.dx, effectiveOffset.dy);

      const dimensions = [{
              component: 'dx',
              min: 'left',
              max: 'right',
              extent: 'width'
          },
          {
              component: 'dy',
              min: 'top',
              max: 'bottom',
              extent: 'height'
          }
      ];

      const flip = (tooLarge, boundary) => {
          return tooLarge ? !boundary : boundary
      };

      dimensions.forEach(d => {
          const tooLarge = boundingBox[d.extent] * scale > canvasSize[d.extent];
          const min = boundingBox[d.min] * scale + effectiveOffset[d.component];
          if (flip(tooLarge, min < canvasPadding)) {
              constrainedOffset[d.component] = canvasPadding - boundingBox[d.min] * scale;
          }
          const max = boundingBox[d.max] * scale + effectiveOffset[d.component];
          if (flip(tooLarge, max > canvasPadding + canvasSize[d.extent])) {
              constrainedOffset[d.component] = canvasPadding + canvasSize[d.extent] - boundingBox[d.max] * scale;
          }
      });

      return constrainedOffset
  };

  const doubleClick = (canvasPosition) => {
      return function(dispatch, getState) {
          const state = getState();
          const visualGraph = getVisualGraph(state);
          const graphPosition = toGraphPosition(state, canvasPosition);
          const item = visualGraph.entityAtPoint(graphPosition);
          if (item) {
              dispatch(activateEditing(item));
          }
      }
  };

  const mouseDown = (canvasPosition, multiSelectModifierKey) => {
      return function(dispatch, getState) {
          const state = getState();
          const visualGraph = getVisualGraph(state);
          const transformationHandles = getTransformationHandles(state);
          const graphPosition = toGraphPosition(state, canvasPosition);

          const handle = transformationHandles.handleAtPoint(canvasPosition);
          if (handle) {
              dispatch(mouseDownOnHandle(handle.corner, canvasPosition, getPositionsOfSelectedNodes(state)));
          } else {
              const item = visualGraph.entityAtPoint(graphPosition);
              if (item) {
                  switch (item.entityType) {
                      case 'node':
                          dispatch(toggleSelection([item], multiSelectModifierKey ? 'xor' : 'at-least'));
                          dispatch(mouseDownOnNode(item, canvasPosition, graphPosition));
                          break

                      case 'relationship':
                          dispatch(toggleSelection([item], multiSelectModifierKey ? 'xor' : 'at-least'));
                          break

                      case 'nodeRing':
                          dispatch(mouseDownOnNodeRing(item, canvasPosition));
                          break
                  }
              } else {
                  if (!multiSelectModifierKey) {
                      dispatch(clearSelection());
                  }
                  dispatch(mouseDownOnCanvas(canvasPosition, graphPosition));
              }
          }
      }
  };

  const mouseDownOnHandle = (corner, canvasPosition, nodePositions) => ({
      type: 'MOUSE_DOWN_ON_HANDLE',
      corner,
      canvasPosition,
      nodePositions
  });

  const lockHandleDragType = (dragType) => ({
      type: 'LOCK_HANDLE_DRAG_MODE',
      dragType
  });

  const mouseDownOnNode = (node, canvasPosition, graphPosition) => ({
      type: 'MOUSE_DOWN_ON_NODE',
      node,
      position: canvasPosition,
      graphPosition
  });

  const mouseDownOnNodeRing = (node, canvasPosition) => ({
      type: 'MOUSE_DOWN_ON_NODE_RING',
      node,
      position: canvasPosition
  });

  const mouseDownOnCanvas = (canvasPosition, graphPosition) => ({
      type: 'MOUSE_DOWN_ON_CANVAS',
      canvasPosition,
      graphPosition
  });

  const furtherThanDragThreshold = (previousPosition, newPosition) => {
      const movementDelta = newPosition.vectorFrom(previousPosition);
      return movementDelta.distance() >= 3
  };

  const mouseMove = (canvasPosition) => {
      return function(dispatch, getState) {
          const state = getState();
          const visualGraph = getVisualGraph(state);
          const graphPosition = toGraphPosition(state, canvasPosition);
          const dragging = state.gestures.dragToCreate;
          const mouse = state.mouse;
          const previousPosition = mouse.mousePosition;

          const eventHandlers = getEventHandlers(state, 'mouseMove');
          const preventDefault = eventHandlers.reduce((prevented, handler) => handler({
              mouse,
              dispatch
          }) || prevented, false);

          if (!preventDefault) {
              switch (mouse.dragType) {
                  case 'NONE':
                      const item = visualGraph.entityAtPoint(graphPosition);
                      if (item && item.entityType === 'nodeRing') {
                          // mouse inter node highlight node ring
                          if (dragging.sourceNodeId === null || (dragging.sourceNodeId && item.id !== dragging.sourceNodeId)) {
                              dispatch(activateRing(item.id, item.type));
                          }
                      } else {
                          if (dragging.sourceNodeId !== null) {
                              dispatch(deactivateRing());
                          }
                      }
                      break

                  case 'HANDLE':
                  case 'HANDLE_ROTATE':
                  case 'HANDLE_SCALE':
                      if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
                          dispatch(tryMoveHandle({
                              dragType: mouse.dragType,
                              corner: mouse.corner,
                              initialNodePositions: mouse.initialNodePositions,
                              initialMousePosition: mouse.initialMousePosition,
                              newMousePosition: canvasPosition
                          }));
                      }
                      break

                  case 'NODE':
                      if (mouse.dragged || furtherThanDragThreshold(previousPosition, canvasPosition)) {
                          dispatch(tryMoveNode({
                              nodeId: mouse.node.id,
                              oldMousePosition: previousPosition,
                              newMousePosition: canvasPosition
                          }));
                      }
                      break

                  case 'NODE_RING':
                      dispatch(tryDragRing(mouse.node.id, graphPosition));
                      break

                  case 'CANVAS':
                  case 'MARQUEE':
                      dispatch(setMarquee(mouse.mouseDownPosition, graphPosition));
                      break
              }
          }
      }
  };

  const mouseUp = () => {
      return function(dispatch, getState) {
          const state = getState();
          const mouse = state.mouse;
          const graph = getPresentGraph(state);

          const eventHandlers = getEventHandlers(state, 'mouseUp');
          const preventDefault = eventHandlers.reduce((prevented, handler) => handler({
              state,
              dispatch
          }) || prevented, false);

          if (!preventDefault) {
              switch (mouse.dragType) {
                  case 'MARQUEE':
                      dispatch(selectItemsInMarquee());
                      break
                  case 'HANDLE':
                      dispatch(moveNodesEndDrag(getPositionsOfSelectedNodes(state)));
                      break
                  case 'NODE':
                      dispatch(moveNodesEndDrag(getPositionsOfSelectedNodes(state)));
                      break
                  case 'NODE_RING':
                      const dragToCreate = state.gestures.dragToCreate;

                      if (dragToCreate.sourceNodeId) {
                          if (dragToCreate.targetNodeIds.length > 0) {
                              dispatch(connectNodes(
                                  [dragToCreate.sourceNodeId, ...dragToCreate.secondarySourceNodeIds],
                                  dragToCreate.targetNodeIds
                              ));
                          } else if (dragToCreate.newNodePosition) {
                              const sourceNodePosition = graph.nodes.find(node => node.id === dragToCreate.sourceNodeId).position;
                              const targetNodeDisplacement = dragToCreate.newNodePosition.vectorFrom(sourceNodePosition);
                              dispatch(createNodesAndRelationships(
                                  [dragToCreate.sourceNodeId, ...dragToCreate.secondarySourceNodeIds],
                                  targetNodeDisplacement
                              ));
                          }
                      }
                      break
              }
          }

          dispatch(endDrag());
      }
  };

  const endDrag = () => {
      return {
          type: 'END_DRAG'
      }
  };

  class HandleGuide {

      constructor(handlePosition) {
          this.handlePosition = handlePosition;
      }

      get type() {
          return 'HANDLE'
      }
  }

  const initGraph = (graph) => ({
      category: 'GRAPH',
      type: 'INIT_GRAPH',
      graph
  });

  const createNodesAndRelationships = (sourceNodeIds, targetNodeDisplacement) => (dispatch, getState) => {
      const graph = getPresentGraph(getState());

      const newRelationshipIds = [];
      const targetNodeIds = [];
      let newRelationshipId = nextAvailableId(graph.relationships);
      let targetNodeId = nextAvailableId(graph.nodes);

      const targetNodePositions = [];

      sourceNodeIds.forEach((sourceNodeId) => {
          newRelationshipIds.push(newRelationshipId);
          targetNodeIds.push(targetNodeId);

          newRelationshipId = nextId(newRelationshipId);
          targetNodeId = nextId(targetNodeId);

          const sourceNodePosition = graph.nodes.find(node => node.id === sourceNodeId).position;
          targetNodePositions.push(sourceNodePosition.translate(targetNodeDisplacement));
      });

      dispatch({
          category: 'GRAPH',
          type: 'CREATE_NODES_AND_RELATIONSHIPS',
          sourceNodeIds,
          newRelationshipIds,
          targetNodeIds,
          targetNodePositions,
          caption: '',
          style: {}
      });
  };

  const connectNodes = (sourceNodeIds, targetNodeIds) => (dispatch, getState) => {
      const graph = getPresentGraph(getState());
      const newRelationshipIds = [];
      let newRelationshipId = nextAvailableId(graph.relationships);
      sourceNodeIds.forEach(() => {
          newRelationshipIds.push(newRelationshipId);
          newRelationshipId = nextId(newRelationshipId);
      });

      dispatch({
          category: 'GRAPH',
          type: 'CONNECT_NODES',
          sourceNodeIds,
          newRelationshipIds,
          targetNodeIds
      });
  };

  const tryMoveHandle = ({
      dragType,
      corner,
      initialNodePositions,
      initialMousePosition,
      newMousePosition
  }) => {
      function applyScale(vector, viewTransformation, dispatch, mouse) {
          const maxDiameter = Math.max(...initialNodePositions.map(entry => entry.radius)) * 2;

          const dimensions = ['x', 'y'];
          const ranges = {};

          const choose = (mode, min, max, other) => {
              switch (mode) {
                  case 'min':
                      return min
                  case 'max':
                      return max
                  default:
                      return other
              }
          };

          dimensions.forEach(dimension => {
              const coordinates = initialNodePositions.map(entry => entry.position[dimension]);
              const min = Math.min(...coordinates);
              const max = Math.max(...coordinates);
              const oldSpread = max - min;
              let newSpread = choose(
                  corner[dimension],
                  oldSpread - vector['d' + dimension],
                  oldSpread + vector['d' + dimension],
                  oldSpread
              );
              if (newSpread < 0) {
                  if (newSpread < -maxDiameter) {
                      newSpread += maxDiameter;
                  } else {
                      newSpread = 0;
                  }
              }
              ranges[dimension] = {
                  min,
                  max,
                  oldSpread,
                  newSpread
              };
          });
          const snapRatios = [-1, 1];
          if (corner.x !== 'mid' && corner.y !== 'mid') {
              let ratio = Math.max(...dimensions.map(dimension => {
                  const range = ranges[dimension];
                  return range.newSpread / range.oldSpread;
              }));
              let smallestSpread = Math.min(...dimensions.map(dimension => ranges[dimension].oldSpread));
              snapRatios.forEach(snapRatio => {
                  if (Math.abs(ratio - snapRatio) * smallestSpread < snapTolerance) {
                      ratio = snapRatio;
                  }
              });
              dimensions.forEach(dimension => {
                  const range = ranges[dimension];
                  range.newSpread = range.oldSpread * ratio;
              });
          } else {
              dimensions.forEach(dimension => {
                  const range = ranges[dimension];
                  let ratio = range.newSpread / range.oldSpread;
                  snapRatios.forEach(snapRatio => {
                      if (Math.abs(ratio - snapRatio) * range.oldSpread < snapTolerance) {
                          ratio = snapRatio;
                      }
                  });
                  range.newSpread = range.oldSpread * ratio;
              });
          }

          const coordinate = (position, dimension) => {
              const original = position[dimension];
              const range = ranges[dimension];
              switch (corner[dimension]) {
                  case 'min':
                      return range.max - (range.max - original) * range.newSpread / range.oldSpread
                  case 'max':
                      return range.min + (original - range.min) * range.newSpread / range.oldSpread
                  default:
                      return original
              }
          };

          const nodePositions = initialNodePositions.map(entry => {
              return {
                  nodeId: entry.nodeId,
                  position: new Point(
                      coordinate(entry.position, 'x'),
                      coordinate(entry.position, 'y')
                  )
              }
          });

          const guidelines = [];
          guidelines.push(new HandleGuide(viewTransformation.inverse(newMousePosition)));
          dimensions.forEach(dimension => {
              if (corner[dimension] !== 'mid') {
                  const range = ranges[dimension];
                  const guideline = {};
                  guideline.type = dimension === 'x' ? 'VERTICAL' : 'HORIZONTAL';
                  guideline[dimension] = corner[dimension] === 'min' ? range.max : range.min;
                  guidelines.push(guideline);
              }
          });

          dispatch(moveNodes(initialMousePosition, newMousePosition || mouse.mousePosition, nodePositions, new Guides(guidelines)));
      }

      function applyRotation(viewTransformation, dispatch, mouse) {

          const center = average(initialNodePositions.map(entry => entry.position));
          const initialOffset = viewTransformation.inverse(initialMousePosition).vectorFrom(center);
          const radius = initialOffset.distance();
          const guidelines = [];
          guidelines.push(new CircleGuide(center, radius, newMousePosition));

          const initialAngle = initialOffset.angle();
          let newAngle = viewTransformation.inverse(newMousePosition).vectorFrom(center).angle();
          let rotationAngle = newAngle - initialAngle;
          const snappedAngle = Math.round(rotationAngle / angleTolerance) * angleTolerance;
          const snapError = Math.abs(rotationAngle - snappedAngle);
          if (snapError < Math.PI / 20) {
              rotationAngle = snappedAngle;
              newAngle = initialAngle + rotationAngle;
              guidelines.push(new LineGuide(center, initialAngle, newMousePosition));
              guidelines.push(new LineGuide(center, newAngle, newMousePosition));
          }
          guidelines.push(new HandleGuide(center.translate(initialOffset.rotate(rotationAngle))));

          const nodePositions = initialNodePositions.map(entry => {
              return {
                  nodeId: entry.nodeId,
                  position: center.translate(entry.position.vectorFrom(center).rotate(rotationAngle))
              }
          });

          const guides = new Guides(guidelines);

          dispatch(moveNodes(initialMousePosition, newMousePosition || mouse.mousePosition, nodePositions, guides));
      }

      return function(dispatch, getState) {
          const {
              viewTransformation,
              mouse
          } = getState();

          const mouseVector = newMousePosition.vectorFrom(initialMousePosition).scale(1 / viewTransformation.scale);

          let mode = dragType;
          if (mode === 'HANDLE') {
              const center = average(initialNodePositions.map(entry => entry.position));
              const centerVector = viewTransformation.inverse(initialMousePosition).vectorFrom(center);

              if (Math.abs(centerVector.unit().dot(mouseVector.unit())) < 0.5) {
                  mode = 'HANDLE_ROTATE';
              } else {
                  mode = 'HANDLE_SCALE';
              }

              if (mouseVector.distance() > 20) {
                  dispatch(lockHandleDragType(mode));
              }
          }

          switch (mode) {
              case 'HANDLE_ROTATE':
                  applyRotation(viewTransformation, dispatch, mouse);
                  break

              case 'HANDLE_SCALE':
                  applyScale(mouseVector, viewTransformation, dispatch, mouse);
                  break
          }
      }
  };

  const tryMoveNode = ({
      nodeId,
      oldMousePosition,
      newMousePosition,
      forcedNodePosition
  }) => {
      return function(dispatch, getState) {
          const state = getState();
          const {
              viewTransformation,
              mouse
          } = state;
          const visualGraph = getVisualGraph(state);
          const graph = visualGraph.graph;
          const visualNode = visualGraph.nodes[nodeId];
          let naturalPosition;
          const otherSelectedNodes = selectedNodeIds(state.selection).filter((selectedNodeId) => selectedNodeId !== nodeId);
          const activelyMovedNode = graph.nodes.find((node) => idsMatch(node.id, nodeId));

          if (forcedNodePosition) {
              naturalPosition = forcedNodePosition;
          } else {
              const vector = newMousePosition.vectorFrom(oldMousePosition).scale(1 / viewTransformation.scale);
              let currentPosition = getState().guides.naturalPosition || activelyMovedNode.position;

              naturalPosition = currentPosition.translate(vector);
          }

          let snaps = snapToNeighbourDistancesAndAngles(graph, nodeId, naturalPosition, otherSelectedNodes);
          let guides = new Guides();
          let newPosition = naturalPosition;
          if (snaps.snapped) {
              guides = new Guides(snaps.guidelines, naturalPosition, visualNode.radius);
              newPosition = snaps.snappedPosition;
          }
          const delta = newPosition.vectorFrom(activelyMovedNode.position);
          const nodePositions = [{
              nodeId,
              position: newPosition
          }];
          otherSelectedNodes.forEach((otherNodeId) => {
              nodePositions.push({
                  nodeId: otherNodeId,
                  position: graph.nodes.find((node) => idsMatch(node.id, otherNodeId)).position.translate(delta)
              });
          });

          dispatch(moveNodes(oldMousePosition, newMousePosition || mouse.mousePosition, nodePositions, guides));
      }
  };

  const moveNodes = (oldMousePosition, newMousePosition, nodePositions, guides, autoGenerated) => {
      return {
          category: 'GRAPH',
          type: 'MOVE_NODES',
          oldMousePosition,
          newMousePosition,
          nodePositions,
          guides,
          autoGenerated
      }
  };

  const moveNodesEndDrag = (nodePositions) => {
      return {
          category: 'GRAPH',
          type: 'MOVE_NODES_END_DRAG',
          nodePositions
      }
  };

  const observedActionTypes = [
      'NEW_GOOGLE_DRIVE_DIAGRAM',
      'NEW_LOCAL_STORAGE_DIAGRAM',
      'CREATE_NODE',
      'MOVE_NODES',
      'MOVE_NODES_END_DRAG',
      'GETTING_GRAPH_SUCCEEDED',
      'DUPLICATE_NODES_AND_RELATIONSHIPS',
      'DELETE_NODES_AND_RELATIONSHIPS',
      'WINDOW_RESIZED',
      'TOGGLE_INSPECTOR',
      'IMPORT_NODES_AND_RELATIONSHIPS'
  ];

  const nodeMovedOutsideCanvas = (visualGraph, canvasSize, viewTransformation, action) => {
      const node = visualGraph.nodes[action.nodePositions[0].nodeId];
      const nodeBoundingBox = node.boundingBox()
          .scale(viewTransformation.scale)
          .translate(viewTransformation.offset);

      const canvasBoundingBox = new BoundingBox(
          canvasPadding,
          canvasSize.width - canvasPadding,
          canvasPadding,
          canvasSize.height - canvasPadding
      );

      return !canvasBoundingBox.containsBoundingBox(nodeBoundingBox)
  };

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

  const viewportMiddleware = store => next => action => {
      const result = next(action);

      if (!action.autoGenerated && observedActionTypes.includes(action.type)) {
          const state = store.getState();
          const {
              applicationLayout,
              viewTransformation,
              mouse
          } = state;
          const canvasSize = computeCanvasSize(applicationLayout);
          const visualGraph = getVisualGraph(state);

          if (action.type === 'MOVE_NODES') {
              const shouldScaleUp = nodeMovedOutsideCanvas(visualGraph, canvasSize, viewTransformation, action);
              if (shouldScaleUp) {
                  let {
                      scale,
                      translateVector
                  } = calculateViewportTranslation(visualGraph, canvasSize);

                  store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy));

                  if (mouse.mouseToNodeVector) {
                      const newViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy));
                      const mousePositionInGraph = newViewTransformation.inverse(action.newMousePosition || mouse.mousePosition);

                      const expectedNodePositionbyMouse = mousePositionInGraph.translate(mouse.mouseToNodeVector.scale(viewTransformation.scale));
                      const differenceVector = expectedNodePositionbyMouse.vectorFrom(action.nodePositions[0].position);

                      if (differenceVector.distance() > 1) {
                          window.requestAnimationFrame(() => store.dispatch(tryMoveNode({
                              nodeId: action.nodePositions[0].nodeId,
                              oldMousePosition: action.oldMousePosition,
                              newMousePosition: null,
                              forcedNodePosition: expectedNodePositionbyMouse
                          })));
                      }
                  }
              }
          } else {
              let {
                  scale,
                  translateVector
              } = calculateViewportTranslation(visualGraph, canvasSize);

              if (scale) {
                  if (action.type === 'MOVE_NODES_END_DRAG') {
                      if (scale > viewTransformation.scale) {
                          let currentStep = 0;
                          let duration = 1000;
                          let fps = 60;

                          const targetViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy));
                          const {
                              scaleTable,
                              panningTable
                          } = calculateTransformationTable(viewTransformation, targetViewTransformation, duration / fps);

                          const animateScale = () => {
                              setTimeout(() => {
                                  const nextScale = scaleTable[currentStep];
                                  const nextPan = panningTable[currentStep];

                                  store.dispatch(adjustViewport(nextScale, nextPan.dx, nextPan.dy));

                                  currentStep++;
                                  if (currentStep < scaleTable.length) {
                                      window.requestAnimationFrame(animateScale);
                                  }
                              }, 1000 / fps);
                          };

                          window.requestAnimationFrame(animateScale);
                      }
                  } else {
                      store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy));
                  }
              }
          }
      }

      return result
  };

  const calculateTransformationTable = (currentViewTransformation, targetViewTransformation, totalSteps) => {
      let lastScale = currentViewTransformation.scale;
      const targetScale = targetViewTransformation.scale;
      const scaleByStep = (targetScale - lastScale) / totalSteps;

      let lastPan = {
          dx: currentViewTransformation.offset.dx,
          dy: currentViewTransformation.offset.dy
      };
      const panByStep = {
          dx: (targetViewTransformation.offset.dx - lastPan.dx) / totalSteps,
          dy: (targetViewTransformation.offset.dy - lastPan.dy) / totalSteps
      };

      const scaleTable = [];
      const panningTable = [];
      let stepIndex = 0;

      while (stepIndex < totalSteps - 1) {
          lastScale += scaleByStep;
          lastPan = {
              dx: lastPan.dx + panByStep.dx,
              dy: lastPan.dy + panByStep.dy
          };

          scaleTable.push(lastScale);
          panningTable.push(lastPan);

          stepIndex++;
      }

      // because of decimal figures does not sum up to exact number
      scaleTable.push(targetViewTransformation.scale);
      panningTable.push(targetViewTransformation.offset);

      return {
          scaleTable,
          panningTable
      }
  };

  const windowLocationHashMiddleware = store => next => action => {
      const oldStorage = store.getState().storage;
      const result = next(action);
      const newStorage = store.getState().storage;

      if (oldStorage !== newStorage && newStorage.status === 'READY') {
          switch (newStorage.mode) {
              case 'GOOGLE_DRIVE':
                  if (newStorage.fileId) {
                      window.location.hash = `#/googledrive/ids=${newStorage.fileId}`;
                  }
                  break
              case 'DATABASE':
                  window.location.hash = `#/neo4j`;
                  break
              case 'LOCAL_STORAGE':
                  window.location.hash = `#/local/id=${newStorage.fileId}`;
                  break
          }
      }

      return result
  };

  const imageEvent = (imageUrl, cachedImage) => ({
      type: 'IMAGE_EVENT',
      imageUrl,
      cachedImage
  });

  const imageCacheMiddleware = store => next => action => {
      const result = next(action);

      if (action.category === 'GRAPH') {
          const state = store.getState();
          const graph = getPresentGraph(state);
          const cachedImages = state.cachedImages;

          const referencedImageUrls = collectImageUrlsFromGraph(graph);
          for (const imageUrl of referencedImageUrls) {
              if (!containsCachedImage(cachedImages, imageUrl)) {
                  const loadingImage = loadImage(imageUrl, (cachedImage) => {
                      store.dispatch(imageEvent(imageUrl, cachedImage));
                  }, (errorImage) => {
                      store.dispatch(imageEvent(imageUrl, errorImage));
                  });
                  store.dispatch(imageEvent(imageUrl, loadingImage));
              }
          }
      }

      return result
  };

  const collectImageUrlsFromGraph = (graph) => {
      const imageUrls = new Set();
      collectImageUrlsFromStyle(imageUrls, graph.style);
      for (const node of graph.nodes) {
          collectImageUrlsFromStyle(imageUrls, node.style);
      }
      for (const relationship of graph.relationships) {
          collectImageUrlsFromStyle(imageUrls, relationship.style);
      }
      return imageUrls
  };

  const collectImageUrlsFromStyle = (imageUrls, style) => {
      for (const [key, value] of Object.entries(style)) {
          if (imageAttributes.includes(key) && value) {
              imageUrls.add(value);
          }
      }
  };

  // 执行顺讯 windowLocationHashMiddleware -> viewportMiddleware -> imageCacheMiddleware
  const middleware = [
      // recentStorageMiddleware,
      // storageMiddleware,
      windowLocationHashMiddleware,
      viewportMiddleware,
      imageCacheMiddleware
  ];

  class StateController {
      constructor() {
          this.store = redux.exports.createStore(
              arrowsAppReducers,
              {},
              redux.exports.applyMiddleware(thunk, ...middleware)
          );

          this.instance = null;
      }

      getStore() {
          return this.store
      }

      // observe data change
      subscribeEvent(callback) {
          let currentValue;
          const self = this;
          function handleChange() {
              let previousValue = currentValue;
              currentValue = self.oberserData(self.store.getState());
              console.log(previousValue, currentValue);
              callback && callback(currentValue);
              // if (previousValue !== currentValue) {
              //     console.log(
              //         'Some deep nested property changed from',
              //         previousValue,
              //         'to',
              //         currentValue
              //     )
              // }
          }

          const unsubscribe = self.store.subscribe(handleChange);
          handleChange();
          return unsubscribe
      }

      oberserData(state) {
          /* oberser gestures graph viewTransformation
              if gestures graph viewTransformation data changed 
              the view will rerender
          */
          return {
              visualGraph: getVisualGraph(state),
              backgroundImage: getBackgroundImage(state),
              selection: state.selection,
              gestures: state.gestures,
              guides: state.guides,
              handles: getTransformationHandles(state),
              canvasSize: computeCanvasSize(state.applicationLayout),
              viewTransformation: state.viewTransformation,
              storage: state.storage
          }
      }

      // 单例模式
      static getInstance() {
          if (this.instance) {
              return this.instance
          }

          return this.instance = new StateController()
      }
  }

  const windowResized = (width, height) => {
      return {
          type: 'WINDOW_RESIZED',
          width,
          height
      }
  };

  const isMac = navigator.appVersion.indexOf('Mac') !== -1;

  class MouseHandler {
      constructor(canvas) {
          this.canvas = canvas;

          this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
          this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
          this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
          this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
          this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
          this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      }

      setDispatch(dispatch) {
          this.dispatch = dispatch;
      }

      handleWheel(evt) {
          this.dispatch(wheel(this.canvasPosition(evt), new Vector(evt.deltaX, evt.deltaY), evt.ctrlKey));
          evt.preventDefault();
      }

      handleDoubleClick(evt) {
          this.dispatch(doubleClick(this.canvasPosition(evt)));
          evt.preventDefault();
      }

      handleMouseMove(evt) {
          if (evt.button !== 0) {
              return
          }
          this.dispatch(mouseMove(this.canvasPosition(evt)));
          evt.preventDefault();
      }

      handleMouseDown(evt) {
          if (evt.button !== 0) {
              return
          }

          this.dispatch(mouseDown(this.canvasPosition(evt), isMac ? evt.metaKey : evt.ctrlKey));
          evt.preventDefault();
      }

      handleMouseUp(evt) {
          if (evt.button !== 0) {
              return
          }

          this.dispatch(mouseUp(this.canvasPosition(evt)));
          evt.preventDefault();
      }

      handleMouseLeave(evt) {
          this.dispatch(endDrag());
          evt.preventDefault();
      }

      canvasPosition(event) {
          let rect = this.canvas.getBoundingClientRect();
          // TODO Origin of right / bottom ISSUE ???
          return new Point(
              event.clientX - rect.left,
              event.clientY - rect.top
          )
      }
  }

  class Gestures {
      /**
       * 
       * @param {*} visualGraph 图数据
       * @param {*} gestures 
       {
          dragToCreate: {
              newNodePosition: null,
              secondarySourceNodeIds: [],
              sourceNodeId: null,
              targetNodeIds: []
          },
          selectionMarquee: null
       }
       */
      constructor(visualGraph, gestures) {
          this.visualGraph = visualGraph;
          this.gestures = gestures;

          const style = key => visualGraph.style[key];
          this.marqueeColor = adaptForBackground(black, style);
          this.newEntityColor = adaptForBackground(blueGreen, style);
          this.ringReadyColor = adaptForBackground(purple, style);
      }

      draw(ctx, displayOptions) {
          const {
              visualGraph,
              gestures
          } = this;
          const {
              dragToCreate,
              selectionMarquee
          } = gestures;
          const viewTransformation = displayOptions.viewTransformation;
          const transform = (position) => viewTransformation.transform(position);
          const getBbox = (from, to) => [
              from, {
                  x: to.x,
                  y: from.y
              },
              to, {
                  x: from.x,
                  y: to.y
              },
              from
          ];

          if (selectionMarquee && visualGraph.graph.nodes.length > 0) {
              const marqueeScreen = {
                  from: transform(selectionMarquee.from),
                  to: transform(selectionMarquee.to)
              };
              const bBoxScreen = getBbox(marqueeScreen.from, marqueeScreen.to);

              ctx.save();
              ctx.strokeStyle = this.marqueeColor;
              drawPolygon(ctx, bBoxScreen, false, true);
              ctx.restore();
          }

          const drawNewNodeAndRelationship = (sourceNodeId, targetNodeId, newNodeNaturalPosition) => {
              const sourceNode = visualGraph.nodes[sourceNodeId];
              let newNodeRadius = visualGraph.graph.style.radius;
              if (sourceNode) {
                  const sourceNodeRadius = sourceNode.radius;
                  const outerRadius = sourceNodeRadius + ringMargin;
                  const sourceNodePosition = sourceNode.position;

                  const targetNode = visualGraph.nodes[targetNodeId];
                  if (targetNode) {
                      newNodeRadius = targetNode.radius;
                  }

                  if (newNodeNaturalPosition) {
                      const delta = newNodeNaturalPosition.vectorFrom(sourceNodePosition);
                      let newNodePosition = sourceNodePosition;
                      if (delta.distance() < outerRadius) {
                          newNodeRadius = outerRadius;
                      } else {
                          if (delta.distance() - sourceNodeRadius < newNodeRadius) {
                              const ratio = (delta.distance() - sourceNodeRadius) / newNodeRadius;
                              newNodePosition = sourceNodePosition.translate(delta.scale(ratio));
                              newNodeRadius = (1 - ratio) * outerRadius + ratio * newNodeRadius;
                          } else {
                              newNodePosition = newNodeNaturalPosition;
                          }
                      }

                      ctx.fillStyle = this.newEntityColor;
                      ctx.circle(newNodePosition.x, newNodePosition.y, newNodeRadius, true, false);

                      const dimensions = {
                          arrowWidth: 4,
                          hasArrowHead: true,
                          headWidth: 16,
                          headHeight: 24,
                          chinHeight: 2.4,
                          arrowColor: this.newEntityColor
                      };
                      if (targetNode && sourceNode === targetNode) {
                          const arrow = new BalloonArrow(sourceNodePosition, newNodeRadius, 0, 44, 256, 40, dimensions);
                          arrow.draw(ctx);
                      } else {
                          const arrow = normalStraightArrow(sourceNodePosition, newNodePosition, sourceNodeRadius, newNodeRadius, dimensions);
                          arrow.draw(ctx);
                      }
                  } else {
                      ctx.fillStyle = this.ringReadyColor;
                      ctx.circle(sourceNodePosition.x, sourceNodePosition.y, outerRadius, true, false);
                  }
              }
          };

          if (dragToCreate.sourceNodeId) {
              ctx.save();
              ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
              ctx.scale(viewTransformation.scale, viewTransformation.scale);

              drawNewNodeAndRelationship(
                  dragToCreate.sourceNodeId,
                  dragToCreate.targetNodeIds[0],
                  dragToCreate.newNodePosition
              );

              dragToCreate.secondarySourceNodeIds.forEach((secondarySourceNodeId, i) => {
                  const primarySourceNode = visualGraph.nodes[dragToCreate.sourceNodeId];
                  const secondarySourceNode = visualGraph.nodes[secondarySourceNodeId];
                  const displacement = secondarySourceNode.position.vectorFrom(primarySourceNode.position);

                  const secondaryTargetNodeId = dragToCreate.targetNodeIds[i + 1];
                  if (secondaryTargetNodeId) {
                      const secondaryTargetNode = visualGraph.nodes[secondaryTargetNodeId];

                      drawNewNodeAndRelationship(
                          secondarySourceNodeId,
                          dragToCreate.targetNodeIds[i + 1],
                          secondaryTargetNode.position
                      );
                  } else {
                      drawNewNodeAndRelationship(
                          secondarySourceNodeId,
                          null,
                          dragToCreate.newNodePosition.translate(displacement)
                      );
                  }
              });

              ctx.restore();
          }
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
          this.options = {
              width: '100%',
              height: '100%'
          };

          // merge options
          merge(this.options, options);

          // redux store
          this.stateController = StateController.getInstance();
          this.stateStore = this.stateController.store;

          // dispatch initGraph event
          this.stateStore.dispatch(initGraph(graph));
          // dispatch windowResized
          this.stateStore.dispatch(windowResized(this.options.width, this.options.height));

          // fit canvas
          this.fitCanvasSize(this.canvas, this.options);

          // event listener
          this.mouseHandler = new MouseHandler(this.canvas);
          this.mouseHandler.setDispatch(this.stateStore.dispatch);
          
          // listen render
          this.stateController.subscribeEvent(this.renderVisuals());
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
      renderVisuals(state) {
          const { 
              visualGraph, 
              backgroundImage, 
              selection, 
              gestures, 
              guides, 
              handles, 
              toolboxes, 
              viewTransformation, 
              canvasSize 
          } = state;

          const ctx = this.canvas.getContext('2d');
          ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      
          const visualGestures = new Gestures(visualGraph, gestures);
          // const visualGuides = new VisualGuides(visualGraph, guides)
      
          layerManager.clear();

          // layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
          layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures));
          layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph));
      
          layerManager.renderAll(new CanvasAdaptor(ctx), {
              canvasSize,
              viewTransformation
          });
      }
  }

  return ArrowApp;

}));
