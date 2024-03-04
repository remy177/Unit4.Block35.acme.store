const {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  destroyFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites
} = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/products', async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/favorites', async(req, res, next)=> {
  try {
    res.send(await fetchFavorites(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:userId/favorites/:id', async(req, res, next)=> {
  try {
    await destroyFavorite({ user_id: req.params.userId, product_id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/:id/favorites', async(req, res, next)=> {
  try {
    res.status(201).send(await createFavorite(req.body));
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  await client.connect();
  console.log('connected to database!');

  await createTables();
  console.log('tables created');
  const [cat, david, tessa, acura, lexus, range, honda, benz, bmw, tesla] = await Promise.all([
    createUser({ username: 'cat', password: 's3cr3t' }),
    createUser({ username: 'dave', password: 's3cr3t!' }),
    createUser({ username: 'tess', password: 's3cr3t!!' }),
    createProduct('Acura'),
    createProduct('Lexus'),
    createProduct('Range'),
    createProduct('Honda'),
    createProduct('Benz'),
    createProduct('BMW'),
    createProduct('Tesla')
  ]);

  await Promise.all([
    createFavorite({ user_id: cat.id, product_id: acura.id}),
    createFavorite({ user_id: david.id, product_id: lexus.id}),
    createFavorite({ user_id: tessa.id, product_id: range.id}),
    createFavorite({ user_id: cat.id, product_id: honda.id}),
    createFavorite({ user_id: tessa.id, product_id: benz.id}),
    createFavorite({ user_id: tessa.id, product_id: bmw.id}),
    createFavorite({ user_id: tessa.id, product_id: tesla.id})
  ]);

  //console.log(`${david.name} has an id of ${david.id}`);

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();