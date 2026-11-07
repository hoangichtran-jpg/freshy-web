export const ORDER_STATUS = {
    CHECKING: 'CHECKING',
    MAKING: 'MAKING',
    WAITING: 'WAITING',
    SHIPPING: 'SHIPPING',
    FINISHED: 'FINISHED',
    CANCELED: 'CANCELED',
};

export const ORDER_TABS = [
    { label: 'Chờ xác nhận', status: ORDER_STATUS.CHECKING },
    { label: 'Đang thực hiện', status: ORDER_STATUS.MAKING },
    { label: 'Chờ giao hàng', status: ORDER_STATUS.WAITING },
    { label: 'Đang giao hàng', status: ORDER_STATUS.SHIPPING },
];