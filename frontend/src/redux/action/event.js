import axios from 'axios';
import { server } from '../../server';
export const createevent = (data) => async (dispatch) => {
  try {
    dispatch({
      type: 'eventCreateRequest',
    });

    // Gửi request
    const response = await axios.post(`${server}/event/create-event`, data);

    // Kiểm tra nếu response.data tồn tại và có thuộc tính event
    if (response && response.data && response.data.event) {
      dispatch({
        type: 'eventCreateSuccess',
        payload: response.data.event,
      });
    } else {
      throw new Error('Dữ liệu không hợp lệ từ server');
    }
  } catch (error) {
    // Kiểm tra lỗi từ response của API, nếu không có, sử dụng thông báo mặc định
    const errorMessage =
      error.response?.data?.message || error.message || 'Có lỗi xảy ra!';

    dispatch({
      type: 'eventCreateFail',
      payload: errorMessage,
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: 'getAlleventsShopRequest',
    });

    const { data } = await axios.get(`${server}/event/get-all-events/${id}`);
    dispatch({
      type: 'getAlleventsShopSuccess',
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: 'getAlleventsShopFailed',
      payload: error.response.data.message,
    });
  }
};

// delete event of a shop
export const deleteEvent = (id) => async (dispatch) => {
  try {
    dispatch({
      type: 'deleteeventRequest',
    });

    const { data } = await axios.delete(
      `${server}/event/delete-shop-event/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: 'deleteeventSuccess',
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: 'deleteeventFailed',
      payload: error.response.data.message,
    });
  }
};

// get all events
export const getAllEvents = () => async (dispatch) => {
  try {
    dispatch({
      type: 'getAlleventsRequest',
    });

    const { data } = await axios.get(`${server}/event/get-all-events`);
    dispatch({
      type: 'getAlleventsSuccess',
      payload: data.events,
    });
  } catch (error) {
    dispatch({
      type: 'getAlleventsFailed',
      payload: error.response.data.message,
    });
  }
};
