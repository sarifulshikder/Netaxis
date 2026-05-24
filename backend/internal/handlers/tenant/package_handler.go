package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/netaxis/backend/internal/models/tenant"
	"github.com/netaxis/backend/internal/services"
	"github.com/netaxis/backend/internal/utils"
)

type PackageHandler struct {
	svc *services.PackageService
}

func NewPackageHandler(svc *services.PackageService) *PackageHandler {
	return &PackageHandler{svc: svc}
}

func (h *PackageHandler) List(c *gin.Context) {
	res, err := h.svc.ListPackages()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to list packages", err.Error())
		return
	}
	utils.Success(c, "Packages listed", res)
}

func (h *PackageHandler) Create(c *gin.Context) {
	var req struct {
		Name            string  `json:"name" binding:"required"`
		UploadSpeed     int     `json:"upload_speed" binding:"required"`
		DownloadSpeed   int     `json:"download_speed" binding:"required"`
		Price           float64 `json:"price" binding:"required"`
		MikrotikProfile string  `json:"mikrotik_profile"`
		IsActive        *bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	data := tenant.Package{
		Name:            req.Name,
		UploadSpeed:     req.UploadSpeed,
		DownloadSpeed:   req.DownloadSpeed,
		Price:           req.Price,
		MikrotikProfile: req.MikrotikProfile,
	}
	if req.IsActive != nil {
		data.IsActive = *req.IsActive
	}

	res, err := h.svc.CreatePackage(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create package", nil)
		return
	}
	utils.Success(c, "Package created", res)
}

func (h *PackageHandler) Get(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid package ID", nil)
		return
	}
	res, err := h.svc.GetPackage(id)
	if err != nil {
		// Log internal error, return generic message
		utils.Error(c, http.StatusNotFound, "Package not found", nil)
		return
	}
	utils.Success(c, "Package fetched", res)
}

func (h *PackageHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid package ID", nil)
		return
	}
	var req struct {
		Name            *string  `json:"name"`
		UploadSpeed     *int     `json:"upload_speed"`
		DownloadSpeed   *int     `json:"download_speed"`
		Price           *float64 `json:"price"`
		MikrotikProfile *string  `json:"mikrotik_profile"`
		IsActive        *bool    `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", nil)
		return
	}

	// Only update allowed fields
	updateData := tenant.Package{}
	if req.Name != nil {
		updateData.Name = *req.Name
	}
	if req.UploadSpeed != nil {
		updateData.UploadSpeed = *req.UploadSpeed
	}
	if req.DownloadSpeed != nil {
		updateData.DownloadSpeed = *req.DownloadSpeed
	}
	if req.Price != nil {
		updateData.Price = *req.Price
	}
	if req.MikrotikProfile != nil {
		updateData.MikrotikProfile = *req.MikrotikProfile
	}
	if req.IsActive != nil {
		updateData.IsActive = *req.IsActive
	}

	res, err := h.svc.UpdatePackage(id, updateData)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update package", nil)
		return
	}
	utils.Success(c, "Package updated", res)
}

func (h *PackageHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if _, err := uuid.Parse(id); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid package ID", nil)
		return
	}
	if err := h.svc.DeletePackage(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete package", nil)
		return
	}
	utils.Success(c, "Package deleted", nil)
}
