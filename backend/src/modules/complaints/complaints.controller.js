import * as ComplaintsService from "./complaints.service.js";

export const createComplaint = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body || {};
    if (!title || !description) {
      const e = new Error("title and description are required");
      e.status = 400;
      throw e;
    }
    const created = await ComplaintsService.createComplaint({ userId, title, description });
    res.json(created);
  } catch (error) {
    next(error);
  }
};

export const listMyComplaints = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const data = await ComplaintsService.listMyComplaints({
      userId,
      page: Number(page),
      limit: Number(limit),
      status,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await ComplaintsService.listComplaints({
      page: Number(page),
      limit: Number(limit),
      status,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    if (!status) {
      const e = new Error("status is required");
      e.status = 400;
      throw e;
    }
    const updated = await ComplaintsService.updateComplaint({ id, status });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const complaint = await ComplaintsService.getComplaintById({ id });
    const ownerId = String(complaint.userId?._id || complaint.userId || complaint.userid || "");
    if (requester.role === "STUDENT" && ownerId !== String(requester.id)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const complaint = await ComplaintsService.getComplaintById({ id });
    const ownerId = String(complaint.userId?._id || complaint.userId || complaint.userid || "");
    if (requester.role === "STUDENT" && ownerId !== String(requester.id)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    const deleted = await ComplaintsService.deleteComplaint({ id });
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};
