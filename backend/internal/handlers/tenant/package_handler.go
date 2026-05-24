package tenant

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
	var data tenant.Package
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.CreatePackage(data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to create package", err.Error())
		return
	}
	utils.Success(c, "Package created", res)
}

func (h *PackageHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.svc.GetPackage(id)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "Package not found", err.Error())
		return
	}
	utils.Success(c, "Package fetched", res)
}

func (h *PackageHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var data tenant.Package
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	res, err := h.svc.UpdatePackage(id, data)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update package", err.Error())
		return
	}
	utils.Success(c, "Package updated", res)
}

func (h *PackageHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeletePackage(id); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to delete package", err.Error())
		return
	}
	utils.Success(c, "Package deleted", nil)
}
