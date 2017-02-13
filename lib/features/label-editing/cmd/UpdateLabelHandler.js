'use strict';

var LabelUtil = require('../LabelUtil');

var hasExternalLabel = require('../../../util/LabelUtil').hasExternalLabel;

var getBusinessObject = require('../../../util/ModelUtil').getBusinessObject;

var TextUtil = require('diagram-js/lib/util/Text');

var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12
};

/**
 * A handler that updates the text of a BPMN element.
 */
function UpdateLabelHandler(modeling) {

  var textUtil = new TextUtil({
    style: LABEL_STYLE,
    size: { width: 100 }
  });

  /**
   * Set the label and return the changed elements.
   *
   * Element parameter can be label itself or connection (i.e. sequence flow).
   *
   * @param {djs.model.Base} element
   * @param {String} text
   */
  function setText(element, text) {

    // external label if present
    var label = element.label || element;

    var labelTarget = element.labelTarget || element;

    LabelUtil.setLabel(label, text, labelTarget !== label);

    return [ label, labelTarget ];
  }

  function execute(ctx) {
    ctx.oldLabel = LabelUtil.getLabel(ctx.element);
    return setText(ctx.element, ctx.newLabel);
  }

  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel);
  }

  function postExecute(ctx) {
    var element = ctx.element,
        label = element.label || element;

    // ignore internal labels
    if (!hasExternalLabel(element)) {
      return;
    }

    var text = getBusinessObject(label).name;

    if (text) {
      var box = {
        width: 90,
        height: 30,
        x: label.width / 2 + label.x,
        y: label.height / 2 + label.y
      };

      var textBBox = textUtil.getBBox(text, {
        box: box,
        style: { fontSize: '11px' }
      });

      // resize label shape to fit label text
      modeling.resizeShape(label, {
        x: Math.ceil(label.x + label.width / 2) - Math.ceil((textBBox.width / 2)),
        y: label.y,
        width: Math.ceil(textBBox.width),
        height: Math.ceil(textBBox.height)
      });
    }
  }

  // API

  this.execute = execute;
  this.revert = revert;
  this.postExecute = postExecute;
}

UpdateLabelHandler.$inject = [ 'modeling' ];

module.exports = UpdateLabelHandler;
