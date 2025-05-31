const fs = require('fs');
const fetchCategoriesAndProducts = async () => {
  const categoriesUrl = 'https://api-tiki.vercel.app/categories';
  const productsUrl = 'https://api-tiki.vercel.app/products';

  try {
    // Fetch categories
    const categoriesResponse = await fetch(categoriesUrl);
    const categoriesData = await categoriesResponse.json();

    // Create a category map for quick lookups
    const categoryMap = categoriesData.reduce((map, category) => {
      map[category.id] = { id: parseInt(category.id), name: category.name, icon: category.icon || null };
      return map;
    }, {});

    // Fetch products
    const productsResponse = await fetch(productsUrl);
    const productsData = await productsResponse.json();

    // Extract unique categories from products
    productsData.forEach((product) => {
      product.breadcrumbs.forEach((breadcrumb) => {
        if (!categoryMap[breadcrumb.category_id]) {
          categoryMap[breadcrumb.category_id] = {
            id: parseInt(breadcrumb.category_id),
            name: breadcrumb.name,
            icon: null, // Icon is unavailable in breadcrumbs
          };
        }
      });
    });

    // Convert category map back to an array
    const uniqueCategories = Object.values(categoryMap);

    console.log(uniqueCategories);

    fs.writeFileSync('categories.json', JSON.stringify(uniqueCategories));
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

fetchCategoriesAndProducts();
