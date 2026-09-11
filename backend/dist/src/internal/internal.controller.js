"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalController = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("../tracking/tracking.service");
let InternalController = class InternalController {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async simulateTracking(authHeader) {
        if (process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            throw new common_1.UnauthorizedException("Unauthorized");
        }
        await this.trackingService.advanceAllActiveOrders();
        return { ok: true };
    }
};
exports.InternalController = InternalController;
__decorate([
    (0, common_1.Post)("simulate-tracking"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InternalController.prototype, "simulateTracking", null);
exports.InternalController = InternalController = __decorate([
    (0, common_1.Controller)("internal"),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], InternalController);
//# sourceMappingURL=internal.controller.js.map