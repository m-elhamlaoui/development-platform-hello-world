terraform {
  required_version = ">= 1.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

variable "tenancy_ocid" {
  description = "The OCID of the tenancy"
  type        = string
  sensitive   = true
}

variable "user_ocid" {
  description = "The OCID of the user"
  type        = string
  sensitive   = true
}

variable "fingerprint" {
  description = "The fingerprint of the public key"
  type        = string
  sensitive   = true
}

variable "private_key_path" {
  description = "The path to the private key file"
  type        = string
}

variable "region" {
  description = "The OCI region"
  type        = string
}

variable "compartment_id" {
  description = "The OCID of the compartment where resources will be created"
  type        = string
  sensitive   = true
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

resource "oci_core_vcn" "spaceAppNewtork" {
  compartment_id = var.compartment_id
  cidr_block     = "10.0.0.0/16"
  display_name   = "spaceAppNetwork"
  dns_label      = "spaceAppNetwork"

  freeform_tags = {
    "Environment" = "development"
    "Project"     = "spaceApp"
  }
}

resource "oci_core_subnet" "spaceAppSubnet1" {
  compartment_id = var.compartment_id
  vcn_id = oci_core_vcn.spaceAppNewtork.id
  cidr_block          = "10.0.1.0/24"
}

data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

resource "oci_core_service_gateway" "spaceAppNetworkServiceGateway" {
  compartment_id = var.compartment_id
  vcn_id = oci_core_vcn.spaceAppNewtork.id
  display_name = "spaceAppNetworkServiceGateway"
  
  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
}

# we need nat gateway:ismail , internet gateway:ayman,service_gateway:youssef 