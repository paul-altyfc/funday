const mongoose = require('mongoose');
const Company = mongoose.model('Company')

module.exports = {
    index: async (_req, res) => {
        try {
            const companies = await Company.find().sort('name');
            res.json(companies);
        }
        catch (err) {
            res.json(err);
        }
    },
    show: (req, res) => {
        Company.findById(req.params.id)
            .then((data) => {
                res.json(data)
            })
            .catch(err => res.json(err));
    },
    create: (req, res) => {
        Company.create(req.body)
            .then((data) => {
                res.json(data);
            })
            .catch(err => res.json(err));
    },
    update: (req, res) => {
        Company.updateOne({ _id : req.params.id }, { runValidators: true, context: 'query' }, )
            .then((data) => {
                res.json(data);
            })
            .catch(err => res.json(err));
    },
    destroy: (req, res) => {
        Company.findOneAndDelete({ _id : req.params.id })
            .then((data) => {
                res.json(data);
            })
            .catch(err => {
                res.json(err);
            });
    },
    addEmployee: (req, res) => {
        Company.updateOne({_id : req.params.id}, {$push : {employees: req.body}})
        .then(data => {
            res.json(data);
        })
        .catch(err => res.json(err));
    },
    addProject: (req, res) => {
        Company.findOneAndUpdate({_id : req.params.id}, {$push : {projects: req.body}}, { new: true })
        .then(data => {
            res.json(data);
        })
        .catch(err => res.json(err));
    },
    addDepartment: (req, res) => {
      console.log(req.body);
      console.log(req.body.department);
      Company.findByIdAndUpdate(req.params.id, {$push : {departments : req.body.department }}, { new: true })
        .then(data => {
          console.log(data);
          res.json(data);
        })
        .catch(err => res.json(err));
    }
}