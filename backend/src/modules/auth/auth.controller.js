import * as AuthService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.json({ token: result.token, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = await AuthService.login(req.body);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await AuthService.me(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const assignRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const requesterId = req.user.id;
    if (String(userId) === String(requesterId)) {
      const e = new Error("You cannot change your own role");
      e.status = 403;
      throw e;
    }
    const user = await AuthService.assignRole({ userId, role });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const registerStudent = async (req, res, next) => {
  try {
    const user = await AuthService.register({ ...req.body, role: "STUDENT" });
    res.json(user);
  } catch (error) {
    next(error);
  }
};
