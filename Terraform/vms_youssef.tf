  resource "tls_private_key" "ssh_key1" {
    algorithm = "RSA"
    rsa_bits  = 2048
  }

  resource "local_file" "private_key" {
    filename = "ssh_key_projet_hamlaoui_youssef"
    content  = tls_private_key.ssh_key1.private_key_pem
  }

  resource "local_file" "public_key" {
    filename = "ssh_key_projet_hamlaoui_youssef.pub"
    content  = tls_private_key.ssh_key1.public_key_openssh
  }

  resource "oci_core_instance" "conrtolPlane" {
    availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
    compartment_id      = var.compartment_id
    display_name        = "controlePlane"
    shape               = "VM.Standard3.Flex"

    shape_config {
      ocpus         = 2
      memory_in_gbs = 16
    }

    create_vnic_details {
      subnet_id                 = oci_core_subnet.spaceAppPublicSubnet.id
      assign_public_ip          = true
      assign_private_dns_record = true
    }

    source_details {
      source_type = "image"
      source_id   = data.oci_core_images.ubuntu_images.images[0].id
    }

    metadata = {
      ssh_authorized_keys = tls_private_key.ssh_key1.public_key_openssh
    }
  }

  resource "oci_core_instance" "machine2" {
    availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
    compartment_id = var.compartment_id
    display_name = "machine2"
    shape = "VM.Standard3.Flex"

    shape_config {
      ocpus = 1
      memory_in_gbs = 12
    }

    create_vnic_details {
      subnet_id = oci_core_subnet.spaceAppPublicSubnet.id
      assign_public_ip = true
      assign_private_dns_record = true
    }

    source_details {
      source_type = "image"
      source_id   = data.oci_core_images.ubuntu_images.images[0].id
    }

    metadata = {
      ssh_authorized_keys = tls_private_key.ssh_key1.public_key_openssh
    }
  }
