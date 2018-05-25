module.exports = {
  path: '/companies',
  methods: ['post'],
  title: 'Create a company',
  description: 'This is an endpoint to fetch all people',
  payload: {
    data: {
      blah: 'blah blah'
    }
  },
  response: (req, res) => {
    if (req.method === 'POST') {
      return res.status(400).json({
        errors: [
          {detail: 'Something went wrong :('}
        ]
      })
    }

    if (req.method === 'PUT') {
      return res.status(500).json({
        errors: [
          {detail: 'CRITICAL FAILURE'}
        ]
      })
    }
    return res.status(200).json({
      company: {
        name: 'blah blah'
      }
    })
  }
}
