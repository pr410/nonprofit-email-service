const db = require('../../models');
const slug = require('slug');
const htmlToText = require('html-to-text');

module.exports = (req, res) => {
  /*
        Outstanding issues:
        -- Validate other things? Validations can be added as promises to validationComplete and run concurrently
        -- Clean up sequelize code
  */

  // Will mutate the below object to extract info we need during validation checks
  const valueFromValidation = {};

  // Validate that this list belongs to the user
  const validateListBelongsToUser = db.list.findOne({
    where: {
      name: req.body.listName, // Could use list ID here
      userId: req.user.id
    }
  }).then(instance => { // The requested list exists & it belongs to the user
    if (instance) {
      valueFromValidation.listId = instance.dataValues.id;
      return true;
    } else {
      return false;
    }
  }, err => {
    throw err;
  });

  Promise.all([validateListBelongsToUser]).then(values => {
    if (values.some(x => x === false)) {
      res.status(400).send(); // If any validation promise resolves to false, fail silently. No need to respond as validation is handled client side & this is a security measure.
    } else {
      // Set emailBody to plaintext if type === Plaintext
      const htmlToTextOpts = { wordwrap: false, ignoreImage: true };
      const emailBodyType = req.body.type === 'Plaintext' ? htmlToText.fromString(req.body.emailBody, htmlToTextOpts) : req.body.emailBody;
      // Find or create the campaign
      db.campaign.findOrCreate({
        where: {
          name: req.body.campaignName, // Campaign exists & belongs to user
          userId: req.user.id
        },
        defaults: {
          name: req.body.campaignName, // Repeating these fields to make it clear that this property marks the new row's fields
          fromName: req.body.fromName,
          fromEmail: req.body.fromEmail,
          emailSubject: req.body.emailSubject,
          emailBody: emailBodyType,
          type: req.body.type,
          userId: req.user.id,
          listId: valueFromValidation.listId,
          slug: slug(req.body.campaignName)
        }
      }).then((instance) => {
        if (instance[0].$options.isNewRecord) {
          db.campaignanalytics.create({
            campaignId: instance[0].dataValues.id
          }).then(() => {
            res.send({message: 'New campaign successfully created'});
          });
        } else {
          res.status(400).send(); // As before, form will be validated client side so no need for a response
        }
      }, err => {
        throw err;
      });
    }
  });
};
