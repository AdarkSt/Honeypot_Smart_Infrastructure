const {Router} = require('express')
const { VM, NodeVM } = require('vm2');

const router = Router()

router.post('/compile', (req, res) => {
    const userCode = req.body.code;
    const vm = new NodeVM( {
        console: 'redirect',
        require: {
            external: ['request']
        }
    })
    const vm2 = new VM()
    
    try {
      let output = '';
  
      vm.on('console.log', (log) => {
        output += log + '\n';
      });
      vm.on('console.error', (error) => {
        output += 'Error: ' + error + '\n';
      });
      
      vm.run(userCode)
      const result = vm2.run(userCode);
  
      res.status(200).json({ result: result || "undefined", output });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router