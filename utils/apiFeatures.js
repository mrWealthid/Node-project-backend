class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //2) Advanced filtering
    //{difficulty:'easy', duration: {$gte:5.3}}
    //{difficulty:'easy', duration: {gte:5.3}}
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b{gte|gt|lte|lt}\b/g, (match) => `$${match}`);
    //Fix Me === it didn't work for lt
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //basic sorting
      // query.sort(req.query.sort);
      //advanced sorting
      const sortBy = this.queryString.sort.split(',').join(' ');
      // query.sort(req.query.sort.replace(/,/g, ' '));
      this.query = this.query.sort(sortBy);
    } else {
      // this.query = this.query.sort('-createdAt');
      this.query = this.query.sort('-_id');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    //page=2&limit=10, 1-10====>page 1; 11-20 ===> page 2; 21-30 ====> page3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
