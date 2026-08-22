import * as LeaveService from "./leave.service.js";

export const applyLeave = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, reason } = req.body || {};

    if (!fromDate || !toDate || !reason) {
      const e = new Error("fromDate, toDate and reason are required");
      e.status = 400;
      throw e;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      const e = new Error("Invalid date format");
      e.status = 400;
      throw e;
    }
    if (to < from) {
      const e = new Error("toDate must be after fromDate");
      e.status = 400;
      throw e;
    }

    const leave = await LeaveService.apply({ userId, from, to, reason });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const data = await LeaveService.listMyLeaves({
      userId,
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listPending = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, student, room } = req.query;
    const data = await LeaveService.listPending({
      page: Number(page),
      limit: Number(limit),
      student,
      room,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const id = req.params.id;
    const approverId = req.user.id;
    const updated = await LeaveService.approve({ id, approverId });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const id = req.params.id;
    const approverId = req.user.id;
    const updated = await LeaveService.reject({ id, approverId });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requester = req.user;
    const leave = await LeaveService.getById({ id });
    const ownerId = String(leave.userId?._id || leave.userId || leave.userid || "");
    if (requester.role === "STUDENT" && ownerId !== String(requester.id)) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    res.json(leave);
  } catch (error) {
    next(error);
  }
};

export const deleteLeave = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    await LeaveService.deleteLeave({ id, userId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
