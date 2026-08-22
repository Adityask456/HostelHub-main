import * as MarketplaceService from "./marketplace.service.js";

export const createItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, price } = req.body || {};
    if (!title || !description || price === undefined) {
      const e = new Error("title, description, price are required");
      e.status = 400;
      throw e;
    }
    const created = await MarketplaceService.createItem({
      userId,
      title,
      description,
      price: Number(price),
    });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const listItems = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, status, page = 1, limit = 20 } = req.query;
    const data = await MarketplaceService.listItems({
      search,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = await MarketplaceService.getItemById({ id });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const item = await MarketplaceService.getItemById({ id });
    const ownerId = String(item.userId?._id || item.userId || item.userid || "");

    if (ownerId !== String(requester.id) && !["ADMIN", "WARDEN"].includes(requester.role)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    const { title, description, price, status } = req.body || {};
    const updated = await MarketplaceService.updateItem({ id, title, description, price, status });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const item = await MarketplaceService.getItemById({ id });
    const ownerId = String(item.userId?._id || item.userId || item.userid || "");

    if (ownerId !== String(requester.id) && !["ADMIN", "WARDEN"].includes(requester.role)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    const deleted = await MarketplaceService.deleteItem({ id });
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};

export const markSold = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const item = await MarketplaceService.getItemById({ id });
    const ownerId = String(item.userId?._id || item.userId || item.userid || "");

    if (ownerId !== String(requester.id) && !["ADMIN", "WARDEN"].includes(requester.role)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    const updated = await MarketplaceService.markSold({ id });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
