resource "tls_private_key" "ssh_key_ismail" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "local_file" "private_key_ismail" {
  filename = "ssh_key_hamlaoui_ismail"
  content  = tls_private_key.ssh_key_ismail.private_key_pem
}

resource "local_file" "public_key_ismail" {
  filename = "ssh_key_hamlaoui_ismail.pub"
  content  = tls_private_key.ssh_key_ismail.public_key_openssh
}

resource "oci_core_instance" "ismailVM1" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = "ismailVM1"
  shape               = "VM.Standard3.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 12
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
    ssh_authorized_keys = tls_private_key.ssh_key_ismail.public_key_openssh
  }
}

resource "oci_core_instance" "ismailVM2" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = "ismailVM2"
  shape               = "VM.Standard3.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 12
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
    ssh_authorized_keys = tls_private_key.ssh_key_ismail.public_key_openssh
  }
}