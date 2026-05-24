package tenant

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type ReportHandler struct {
	svc *services.ReportService
}

func NewReportHandler(svc *services.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

func (h *ReportHandler) Revenue(c *gin.Context) {
	startStr := c.DefaultQuery("start", time.Now().AddDate(0, -1, 0).Format("2006-01-02"))
	endStr := c.DefaultQuery("end", time.Now().Format("2006-01-02"))
	
	start, _ := time.Parse("2006-01-02", startStr)
	end, _ := time.Parse("2006-01-02", endStr)

	res, err := h.svc.RevenueReport(start, end)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch revenue report", err.Error())
		return
	}
	utils.Success(c, "Revenue report fetched", res)
}

func (h *ReportHandler) Collection(c *gin.Context) {
	utils.Success(c, "Collection report fetched", nil)
}

func (h *ReportHandler) Customers(c *gin.Context) {
	res, err := h.svc.CustomerReport()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch customer report", err.Error())
		return
	}
	utils.Success(c, "Customer report fetched", res)
}

func (h *ReportHandler) Network(c *gin.Context) {
	utils.Success(c, "Network report fetched", nil)
}

func (h *ReportHandler) Outstanding(c *gin.Context) {
	res, err := h.svc.OutstandingReport()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch outstanding report", err.Error())
		return
	}
	utils.Success(c, "Outstanding report fetched", res)
}

func (h *ReportHandler) ProfitLoss(c *gin.Context) {
	utils.Success(c, "P&L report fetched", nil)
}

func (h *ReportHandler) Tax(c *gin.Context) {
	utils.Success(c, "Tax report fetched", nil)
}
