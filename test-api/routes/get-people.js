module.exports = {
  path: '/people',
  params: {
    id: 'Person unid'
  },
  query: {
    foobar: 'blah blah'
  },
  methods: ['post', 'put', 'get'],
  title: 'Get all people',
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
      people: [
        {
          name: 'John Doe'
        },
        {
          name: 'Bob Smith'
        }
      ]
    })
  }
}
