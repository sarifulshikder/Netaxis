package tenant

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

// trimWhitespace trims all leading and trailing whitespace from a string.
func trimWhitespace(s string) string {
	return strings.TrimSpace(s)
}

type StaffHandler struct {
	svc *services.StaffService
}

func NewStaffHandler(svc *services.StaffService) *StaffHandler {
	return &StaffHandler{svc: svc}
}

func (h *StaffHandler) List(c *gin.Context) {
	res, err := h.svc.ListStaff()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list staff", err.Error())
		return
	}
	utils.Success(c, "Staff listed", res)
}

func (h *StaffHandler) Create(c *gin.Context) {
	var req struct {
		tenant.Staff
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	// Defensive: ensure password is not empty or only whitespace
	if len(req.Password) == 0 || len(trimWhitespace(req.Password)) == 0 {
		utils.Error(c, http.StatusBadRequest, "Password required", nil)
		return
	}

	// Defensive: ensure email is not empty and valid
	if len(req.Staff.Email) == 0 {
		utils.Error(c, http.StatusBadRequest, "Email required", nil)
		return
	}

	res, err := h.svc.CreateStaff(req.Staff, req.Password)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create staff", err.Error())
		return
	}
	utils.Success(c, "Staff created", res)
}

func (h *StaffHandler) Get(c *gin.Context) {
	utils.Success(c, "Staff fetched", nil)
}

func (h *StaffHandler) Update(c *gin.Context) {
	utils.Success(c, "Staff updated", nil)
}

func (h *StaffHandler) Delete(c *gin.Context) {
	utils.Success(c, "Staff deleted", nil)
}

func (h *StaffHandler) CheckIn(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Staff ID required", nil)
		return
	}
	var req struct {
		Location string `json:"location"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.CheckIn(id, req.Location); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to check in", err.Error())
		return
	}
	utils.Success(c, "Checked in successfully", nil)
}

func (h *StaffHandler) CheckOut(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Staff ID required", nil)
		return
	}
	var req struct {
		Location string `json:"location"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	if err := h.svc.CheckOut(id, req.Location); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to check out", err.Error())
		return
	}
	utils.Success(c, "Checked out successfully", nil)
}

func (h *StaffHandler) AttendanceHistory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.Error(c, http.StatusBadRequest, "Staff ID required", nil)
		return
	}
	res, err := h.svc.ListAttendance(id)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch attendance", err.Error())
		return
	}
	utils.Success(c, "Attendance fetched", res)
}

func (h *StaffHandler) PayrollHistory(c *gin.Context) {
	utils.Success(c, "Payroll fetched", nil)
}

func (h *StaffHandler) CreatePayroll(c *gin.Context) {
	utils.Success(c, "Payroll created", nil)
}

func (h *StaffHandler) ApplyLeave(c *gin.Context) {
	// TODO: Implement leave application logic with validation
	utils.Success(c, "Leave applied", nil)
}
