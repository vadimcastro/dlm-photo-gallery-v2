# dlm-photo-gallery-v2 Makefile
# Photo gallery project with Google Photos integration

# Project variables for vadimOS.mk
PROJECT_NAME = dlm-photo-gallery-v2
DROPLET_ALIAS = droplet
PRODUCTION_IP = 206.81.2.168

# Include universal vadimOS commands
include ../vadimOS/vadimOS.mk

# Project-specific PHONY targets
.PHONY: dev-npm dev-docker kd test-api auth-setup quick-deploy deploy-clean

# =============================================================================
# DLM-SPECIFIC DEVELOPMENT COMMANDS
# =============================================================================

# Override dev to use Next.js directly (not Docker)
dev:
	@echo "🚀 Starting Next.js development (with Google Photos API)..."
	cd frontend && npm run dev

dev-docker:
	@echo "🐳 Starting full Docker development environment..."
	cd docker && docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# =============================================================================
# DLM-SPECIFIC UTILITY COMMANDS
# =============================================================================

test-api:
	@echo "🧪 Testing Google Photos API..."
	curl -s http://localhost:3000/api/v1/photos/albums | head -200

kd:
	@echo "💥 Force delete: $(path)"
	@if [ -z "$(path)" ]; then \
		echo "❌ Error: Path not provided. Use 'make kd path=/your/path'"; \
		exit 1; \
	fi
	@if [ "$(path)" = "/" ] || [ "$(path)" = "~" ] || [ "$(path)" = "." ]; then \
		echo "❌ Error: Dangerous path provided. Cannot delete $(path)"; \
		exit 1; \
	fi
	rm -rf $(path)
	@echo "✅ Deleted: $(path)"

# =============================================================================
# DLM-SPECIFIC ALIASES
# =============================================================================

quick-deploy: droplet-quick-deploy

deploy-clean: droplet-clean-rebuild

# =============================================================================
# DLM-SPECIFIC AUTH SETUP
# =============================================================================

auth-setup:
	@echo "🔑 Starting streamlined OAuth setup..."
	./scripts/auth-setup.sh