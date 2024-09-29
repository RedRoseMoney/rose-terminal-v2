import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.body);

  if (req.method === 'POST') {
    const { address, community } = req.body;

    console.log('Received address:', address);
    console.log('Received community:', community);

    if (!address || !community) {
      console.log('Error: Missing address or community');
      return res.status(400).json({ error: 'Address and community are required' });
    }

    try {
      console.log('Fetching registered addresses');
      let registeredAddresses = await kv.get('registered-addresses') || {
        aeon: [],
        sproto: [],
        spx: [],
        mog: [],
        milady: [],
        hpos: []
      };

      // Check if the address exists in any community
      const isAddressRegistered = Object.values(registeredAddresses).some(
        communityAddresses => communityAddresses.includes(address)
      );

      if (isAddressRegistered) {
        console.log('Address already registered in a community');
        return res.status(409).json({ error: 'Address already registered in a community' });
      }

      console.log('Adding new address to the list');
      if (!registeredAddresses[community]) {
        registeredAddresses[community] = [];
      }
      registeredAddresses[community].push(address);

      console.log('Updating database');
      await kv.set('registered-addresses', registeredAddresses);

      console.log('Registration successful');
      return res.status(200).json({ message: 'Address registered successfully' });
    } catch (error) {
      console.error('Error registering address:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    console.log('Invalid method:', req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}