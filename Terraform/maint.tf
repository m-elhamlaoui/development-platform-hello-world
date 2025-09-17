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

resource "oci_core_vcn" "spaceAppNetwork" {
  compartment_id = var.compartment_id
  cidr_block     = "10.0.0.0/16"
  display_name   = "spaceAppNetwork"
  dns_label      = "spaceappnetwork"

  freeform_tags = {
    "Environment" = "development"
    "Project"     = "spaceApp"
  }
}

resource "oci_core_internet_gateway" "spaceAppInternetGateway" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppInternetGateway"
}

resource "oci_core_nat_gateway" "spaceAppNatGateway" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppNatGateway"
}

resource "oci_core_route_table" "spaceAppPublicRouteTable" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppPublicRouteTable"
  
  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.spaceAppInternetGateway.id
  }
}

resource "oci_core_route_table" "spaceAppPrivateRouteTable" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppPrivateRouteTable"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_nat_gateway.spaceAppNatGateway.id
  }

  route_rules {
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    network_entity_id = oci_core_service_gateway.spaceAppNetworkServiceGateway.id
  }
}

resource "oci_core_subnet" "spaceAppPublicSubnet" {
  compartment_id    = var.compartment_id
  vcn_id           = oci_core_vcn.spaceAppNetwork.id
  cidr_block       = "10.0.2.0/24"
  route_table_id   = oci_core_route_table.spaceAppPublicRouteTable.id
  security_list_ids = [oci_core_security_list.spaceAppPublicSecurityList.id]
  display_name     = "spaceAppPublicSubnet"
  dns_label        = "publicsubnet"
}

resource "oci_core_subnet" "spaceAppPrivateSubnet1" {
  compartment_id    = var.compartment_id
  vcn_id           = oci_core_vcn.spaceAppNetwork.id
  cidr_block       = "10.0.1.0/24"
  route_table_id   = oci_core_route_table.spaceAppPrivateRouteTable.id
  display_name     = "spaceAppPrivateSubnet"
  dns_label        = "privatesubnet"
  prohibit_public_ip_on_vnic = true
  security_list_ids = [oci_core_security_list.spaceAppPrivateSecurityList.id]
}

resource "oci_core_security_list" "spaceAppPublicSecurityList" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppPublicSecurityList"
  
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }
  
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }
  
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 8080
      max = 8080
    }
  }
}

resource "oci_core_security_list" "spaceAppPrivateSecurityList" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.spaceAppNetwork.id
  display_name   = "spaceAppPrivateSecurityList"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    protocol = "6"
    source   = "10.0.2.0/24"
    tcp_options {
      min = 22
      max = 22
    }
  }
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
  vcn_id = oci_core_vcn.spaceAppNetwork.id
  display_name = "spaceAppNetworkServiceGateway"
  
  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
}

