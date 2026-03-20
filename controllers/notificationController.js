import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  try {

    const userId = req.user.id || req.user._id;

    const notifications = await Notification
      .find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);

  } catch (error) {

    console.log(error);

    res.status(500).json({ message: "Error Fetching Notifications" });

  }
};

export const markAsRead = async (req, res) => {
  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.status(200).json({
      message: "Notification marked as read"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error updating notification"
    });

  }
};