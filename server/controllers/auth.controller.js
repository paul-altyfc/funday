const Employee = require('mongoose').model('Employee');
const Company = require('mongoose').model('Company');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


module.exports = {
  /**
   * Receives and validates login requests
   * @param {Request} req Request instance
   * @param {Response} res Response instance
   */
  login: (req, res) => {
    Employee.findOne({ email: req.body.email })
      .then(employee => {
        bcrypt.compare(req.body.password, employee.password)
          .then(isValid => {
            if(!isValid) {
              throw new Error();
            }
            Company.findOne({ 'employees._id' : employee._id })
              .then(company => {
                res.json(completeLogin(req, res, employee, company));
              })
              .catch(err => {
                console.log(err);
              });
          })
          .catch(err => {
            res.json(err);
          });
      })
  },
  /**
   * Receives and validates registration requests
   * @param {Request} req Request instance
   * @param {Response} res Response instance
   */
  newCompanyRegister: (req, res) => {
    const name = req.body.name;
    Company.create({name: name})
      .then(async company => {
        let owner;
        req.body.owner.isManager = true;
        req.body.owner.password = await bcrypt.hash(req.body.owner.password, 10);
        try {
          owner = await Employee.create(req.body.owner);
        } catch (err) {
          Company.deleteOne(company);
          res.json(err);
        }
        company.owner = owner;
        company.employees.push(owner);
        Company.findByIdAndUpdate(company._id, company)
          .then(async data => {
            const login = await completeLogin(req, res, owner, company);
            login.data['createdCompany'] = data;
            res.json(login);
          })
          .catch(err => {
            res.json(err);
          })

      })
      .catch(err => {
        res.json(err);
      });
  },
  joinCompanyRegister: async (req, res) => {
    bcrypt.hash(req.body.password, 10)
      .then(hashed => {
        req.body.password = hashed;
        Employee.create(req.body)
          .then(employee => {
            Company.findByIdAndUpdate(req.params.id, {$push : { employees : employee}})
              .then(async company => {
                const login = await completeLogin(req, res, employee, company);
                login.data['joinedCompany'] = company;
                res.json(login);
              })
              .catch(err => {
                res.json(err);
              })
          })
          .catch(err => {
            res.json(err);
          });
      })
      .catch(err => {
        res.json(err);
      })
  },
  /**
   * TODO: Performs JWT logout
   * @param {Request} req Request instance
   * @param {Response} res Response instance
   */
  logout(req, res) {
    console.log('Logging out!');
  }
}
/**
 * Performs login operations after successful validation, generating JWT token
 * @param {Request} req Client request instance
 * @param {Response} res Server response instance
 * @param {Employee} employee Employee instance
 * @param {Company} company Company instance
 */
function completeLogin(req, res, employee, company) {
  // old token implementation:
  // const token = jwt.sign({id: employee._id}, req.app.get('secretKey'), { expiresIn: '1m' });
  const token = jwt.sign({ eid : employee._id, cid : company._id, isOwner : (company.owner.email == employee.email), isManager : employee.isManager }, req.app.get('secretKey'), { expiresIn: '1m' })
  employee = employee.toObject();
  delete employee.password;
  return {status: 'success', message: 'Logged in', data: { employee: employee, token: token }};
}
